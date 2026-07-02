// ── One-Rep Max (Epley) ─────────────────────────
const ormBtn = document.getElementById('orm-btn');
function calcORM() {
  const w = parseFloat(document.getElementById('orm-weight').value);
  const r = parseInt(document.getElementById('orm-reps').value, 10);
  if (!(w > 0) || !(r >= 1)) return;
  // Epley: 1RM = w * (1 + reps/30); reps=1 returns w exactly
  const max = r === 1 ? w : w * (1 + r / 30);
  const rounded = Math.round(max);
  document.getElementById('orm-max').textContent = rounded;

  const pcts = [95, 90, 85, 80, 75, 70, 65, 60];
  document.getElementById('orm-table').innerHTML = pcts.map(p => {
    const load = Math.round((rounded * p) / 100 / 5) * 5; // nearest 5 lb
    return `<tr><td>${p}%</td><td>${load} lb</td></tr>`;
  }).join('');
  document.getElementById('orm-result').hidden = false;
}
ormBtn.addEventListener('click', calcORM);
calcORM();

// ── Plate Math ──────────────────────────────────
const PLATES = [45, 35, 25, 10, 5, 2.5];
document.getElementById('plate-btn').addEventListener('click', () => {
  const total = parseFloat(document.getElementById('plate-total').value);
  const bar = parseFloat(document.getElementById('plate-bar').value);
  const list = document.getElementById('plate-list');
  const note = document.getElementById('plate-note');
  const res = document.getElementById('plate-result');
  res.hidden = false;

  if (!(total >= bar)) {
    list.innerHTML = '';
    note.textContent = `Target must be at least the bar weight (${bar} lb).`;
    return;
  }
  let perSide = (total - bar) / 2;
  const used = [];
  for (const p of PLATES) {
    let count = 0;
    while (perSide >= p - 1e-9) { perSide -= p; count++; }
    if (count) used.push(`${count} × ${p}`);
  }
  list.innerHTML = used.length
    ? used.map(u => `<span class="plate">${u}</span>`).join('')
    : '<span class="plate">just the bar</span>';

  const leftover = Math.round(perSide * 100) / 100;
  note.textContent = leftover > 0
    ? `Per side, plus ${leftover} lb that standard plates can't make exactly.`
    : `Loaded per side. Bar + plates = ${total} lb.`;
});

// ── Workout Log (localStorage) ──────────────────
const LOG_KEY = 'lifting-log-v1';
const logList = document.getElementById('log-list');
const logEmpty = document.getElementById('log-empty');
const logTotal = document.getElementById('log-total');
const logClear = document.getElementById('log-clear');

function loadLog() {
  try { return JSON.parse(localStorage.getItem(LOG_KEY)) || []; }
  catch { return []; }
}
function saveLog(entries) {
  try { localStorage.setItem(LOG_KEY, JSON.stringify(entries)); } catch {}
}
function renderLog() {
  const entries = loadLog();
  logList.innerHTML = entries.map((e, i) =>
    `<li><span><span class="ex">${escapeHtml(e.ex)}</span>
      <span class="meta"> — ${e.wt} lb × ${e.sets} × ${e.reps}</span></span>
      <button data-i="${i}" aria-label="Remove">&times;</button></li>`
  ).join('');
  const volume = entries.reduce((s, e) => s + e.wt * e.sets * e.reps, 0);
  document.getElementById('log-volume').textContent = volume.toLocaleString();
  const has = entries.length > 0;
  logTotal.hidden = !has;
  logClear.hidden = !has;
  logEmpty.hidden = has;
}
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

document.getElementById('log-btn').addEventListener('click', () => {
  const ex = document.getElementById('log-ex').value.trim();
  const wt = parseFloat(document.getElementById('log-wt').value);
  const sets = parseInt(document.getElementById('log-sets').value, 10);
  const reps = parseInt(document.getElementById('log-reps').value, 10);
  if (!ex || !(wt >= 0) || !(sets >= 1) || !(reps >= 1)) return;
  const entries = loadLog();
  entries.push({ ex, wt, sets, reps });
  saveLog(entries);
  document.getElementById('log-ex').value = '';
  document.getElementById('log-wt').value = '';
  document.getElementById('log-sets').value = '';
  document.getElementById('log-reps').value = '';
  document.getElementById('log-ex').focus();
  renderLog();
});
logList.addEventListener('click', e => {
  const btn = e.target.closest('button[data-i]');
  if (!btn) return;
  const entries = loadLog();
  entries.splice(parseInt(btn.dataset.i, 10), 1);
  saveLog(entries);
  renderLog();
});
logClear.addEventListener('click', () => {
  if (confirm('Clear the whole log?')) { saveLog([]); renderLog(); }
});
renderLog();
