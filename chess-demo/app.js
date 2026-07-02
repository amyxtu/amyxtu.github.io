import { Chess } from '../vendor/chess.esm.js';

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const DEPTH = 10;
const BLUNDER_THRESHOLD_CP = 150; // 1.5 pawns

// The "Opera Game": Morphy vs. Duke Karl / Count Isouard, Paris 1858.
const SAMPLE_PGN = `[Event "Paris"]
[White "Paul Morphy"]
[Black "Duke Karl / Count Isouard"]
[Result "1-0"]

1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7
8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8
13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0`;

// ── Engine wrapper (real Stockfish, WebAssembly, runs client-side) ──────────
class Engine {
  constructor(path) {
    this.worker = new Worker(path);
    this.worker.onmessage = e => this._onMessage(e.data);
    this._current = null;
  }
  _onMessage(line) {
    if (line === 'uciok' && this._uciResolve) { this._uciResolve(); this._uciResolve = null; }
    else if (line === 'readyok' && this._readyResolve) { this._readyResolve(); this._readyResolve = null; }
    else if (this._current) {
      if (line.startsWith('info') && line.includes(' score ')) this._current.lastScore = line;
      else if (line.startsWith('bestmove')) {
        const resolve = this._current.resolve;
        const score = this._parseScore(this._current.lastScore);
        this._current = null;
        resolve(score);
      }
    }
  }
  _parseScore(line) {
    if (!line) return { cp: 0 };
    const mate = line.match(/score mate (-?\d+)/);
    if (mate) return { mate: parseInt(mate[1], 10) };
    const cp = line.match(/score cp (-?\d+)/);
    if (cp) return { cp: parseInt(cp[1], 10) };
    return { cp: 0 };
  }
  init() {
    return new Promise(resolve => {
      this._uciResolve = () => {
        this._readyResolve = resolve;
        this.worker.postMessage('isready');
      };
      this.worker.postMessage('uci');
    });
  }
  evaluate(fen, depth) {
    return new Promise(resolve => {
      this._current = { resolve, lastScore: null };
      this.worker.postMessage('position fen ' + fen);
      this.worker.postMessage('go depth ' + depth);
    });
  }
  terminate() { this.worker.terminate(); }
}

// ── DOM ──────────────────────────────────────────────────────────────────
const pgnInput = document.getElementById('pgn');
const sampleBtn = document.getElementById('sample-btn');
const analyzeBtn = document.getElementById('analyze-btn');
const statusEl = document.getElementById('status');
const statusText = document.getElementById('status-text');
const statusBar = document.getElementById('status-bar');
const results = document.getElementById('results');
const summaryTitle = document.getElementById('summary-title');
const summaryText = document.getElementById('summary-text');
const blunderList = document.getElementById('blunder-list');
const moveTable = document.getElementById('move-table');

sampleBtn.addEventListener('click', () => { pgnInput.value = SAMPLE_PGN; });

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function mateProxy(mate) {
  // Large magnitude so a mating line always outranks a normal eval swing.
  return mate > 0 ? 100000 - mate : -100000 - mate;
}

function formatEval(scoreForWhite, mateForWhite) {
  if (mateForWhite !== null) {
    return mateForWhite > 0 ? `#${mateForWhite}` : `#${mateForWhite}`;
  }
  const pawns = scoreForWhite / 100;
  const sign = pawns > 0 ? '+' : '';
  return `${sign}${pawns.toFixed(2)}`;
}

async function analyze() {
  const pgn = pgnInput.value.trim();
  if (!pgn) { pgnInput.focus(); return; }

  analyzeBtn.disabled = true;
  sampleBtn.disabled = true;
  results.hidden = true;
  statusEl.hidden = false;
  statusText.textContent = 'Parsing game…';
  statusBar.style.width = '4%';

  let chess;
  try {
    chess = new Chess();
    chess.loadPgn(pgn);
  } catch (err) {
    statusText.textContent = 'Could not read that PGN. Check the format and try again.';
    statusBar.style.width = '0%';
    analyzeBtn.disabled = false;
    sampleBtn.disabled = false;
    return;
  }

  const history = chess.history({ verbose: true });
  if (!history.length) {
    statusText.textContent = 'No moves found in that PGN.';
    analyzeBtn.disabled = false;
    sampleBtn.disabled = false;
    return;
  }

  const fens = [START_FEN, ...history.map(m => m.after)];

  statusText.textContent = 'Starting chess engine…';
  statusBar.style.width = '8%';
  const engine = new Engine('../vendor/stockfish.wasm.js');
  await engine.init();

  // whiteEval[i] / whiteMate[i] correspond to fens[i] (position AFTER i plies).
  const whiteEval = new Array(fens.length).fill(0);
  const whiteMate = new Array(fens.length).fill(null);

  for (let i = 0; i < fens.length; i++) {
    const fen = fens[i];
    const turn = fen.split(' ')[1]; // 'w' or 'b' to move in this position
    const probe = new Chess(fen);

    if (probe.isCheckmate()) {
      // Side to move has no moves and is in check: the side that just moved delivered mate.
      whiteMate[i] = turn === 'w' ? -1 : 1;
      whiteEval[i] = mateProxy(whiteMate[i]);
    } else if (probe.isStalemate() || probe.isDraw()) {
      whiteEval[i] = 0;
    } else {
      const score = await engine.evaluate(fen, DEPTH);
      if (typeof score.mate === 'number') {
        const whiteMateIn = turn === 'w' ? score.mate : -score.mate;
        whiteMate[i] = whiteMateIn;
        whiteEval[i] = mateProxy(whiteMateIn);
      } else {
        whiteEval[i] = turn === 'w' ? score.cp : -score.cp;
      }
    }

    statusText.textContent = `Evaluating move ${i} of ${fens.length - 1}…`;
    statusBar.style.width = `${8 + Math.round((i / (fens.length - 1)) * 88)}%`;
  }

  engine.terminate();
  statusText.textContent = 'Done.';
  statusBar.style.width = '100%';

  // ── Build move rows + find blunders ──────────────────────────────────
  const rows = [];
  const blunders = [];
  for (let ply = 1; ply <= history.length; ply++) {
    const m = history[ply - 1];
    const delta = whiteEval[ply] - whiteEval[ply - 1];
    const mover = m.color; // 'w' or 'b'
    const isBlunder = mover === 'w'
      ? delta <= -BLUNDER_THRESHOLD_CP
      : delta >= BLUNDER_THRESHOLD_CP;

    // A delta that crosses into/out of a mate score is huge but meaningless in "pawns":
    // describe it qualitatively instead of printing an absurd number.
    const crossesMate = whiteMate[ply] !== null || whiteMate[ply - 1] !== null;
    rows.push({
      ply,
      moveNo: Math.floor((ply - 1) / 2) + 1,
      san: m.san,
      mover,
      evalText: formatEval(whiteEval[ply], whiteMate[ply]),
      isBlunder,
      swingText: crossesMate ? 'swung the evaluation toward a forced mate' : `swung the evaluation by about ${(Math.abs(delta) / 100).toFixed(1)} pawns`
    });
    if (isBlunder) blunders.push(rows[rows.length - 1]);
  }

  moveTable.innerHTML = rows.map(r => `
    <tr class="${r.isBlunder ? 'blunder' : ''}">
      <td>${r.moveNo}${r.mover === 'w' ? '.' : '...'}</td>
      <td class="san">${escapeHtml(r.san)}</td>
      <td>${r.mover === 'w' ? 'White' : 'Black'}</td>
      <td class="eval">${r.evalText}</td>
      <td>${r.isBlunder ? '<span class="flag">Blunder</span>' : ''}</td>
    </tr>`).join('');

  summaryTitle.textContent = blunders.length
    ? `${blunders.length} likely blunder${blunders.length > 1 ? 's' : ''} found`
    : 'No major blunders found';
  summaryText.textContent = blunders.length
    ? `Real-time engine evaluation flagged ${blunders.length} move${blunders.length > 1 ? 's' : ''} where the evaluation swung by 1.5 pawns or more against the player who moved.`
    : 'The evaluation stayed fairly steady all game, engine analysis at depth 10 found nothing over the 1.5-pawn threshold.';
  blunderList.innerHTML = blunders.map(b =>
    `<li><span class="tag-blunder">Move ${b.moveNo}${b.mover === 'w' ? '.' : '...'} ${escapeHtml(b.san)}</span>: ${b.swingText}.</li>`
  ).join('');

  results.hidden = false;
  analyzeBtn.disabled = false;
  sampleBtn.disabled = false;
  setTimeout(() => { statusEl.hidden = true; }, 900);
}

analyzeBtn.addEventListener('click', analyze);
