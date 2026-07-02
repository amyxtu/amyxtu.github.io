// ── Year ──────────────────────────────────────
document.getElementById('year').textContent = new Date().getFullYear();

// ── Theme toggle ───────────────────────────────
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('theme', next); } catch (e) {}
});

// ── Navbar scroll effect ───────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ── Mobile nav toggle ──────────────────────────
const toggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
toggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ── Scroll reveal ──────────────────────────────
const revealEls = document.querySelectorAll(
  '#about .container > *, #experience .container > *, #projects .container > *, #contact .container > *, .project-card, .timeline-item, .about-photo, .about-text, .contact-info, .contact-form'
);
revealEls.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  }),
  { threshold: 0.12 }
);
revealEls.forEach(el => observer.observe(el));

// ── Contact form ───────────────────────────────
const form = document.getElementById('contact-form');

function validate(field, errorId, condition, message) {
  const input = document.getElementById(field);
  const error = document.getElementById(errorId);
  if (!condition(input.value.trim())) {
    input.classList.add('invalid');
    error.textContent = message;
    return false;
  }
  input.classList.remove('invalid');
  error.textContent = '';
  return true;
}

function clearOnInput(fieldId, errorId) {
  document.getElementById(fieldId).addEventListener('input', () => {
    document.getElementById(fieldId).classList.remove('invalid');
    document.getElementById(errorId).textContent = '';
  });
}
['name', 'email', 'subject', 'message'].forEach(f => {
  clearOnInput(f, `${f}-error`);
});

form.addEventListener('submit', async e => {
  e.preventDefault();

  const nameOk    = validate('name',    'name-error',    v => v.length >= 2,            'Name must be at least 2 characters.');
  const emailOk   = validate('email',   'email-error',   v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Please enter a valid email address.');
  const subjectOk = validate('subject', 'subject-error', v => v.length >= 3,            'Subject must be at least 3 characters.');
  const messageOk = validate('message', 'message-error', v => v.length >= 10,           'Message must be at least 10 characters.');

  if (!(nameOk && emailOk && subjectOk && messageOk)) return;

  const btn      = document.getElementById('submit-btn');
  const btnText  = btn.querySelector('.btn-text');
  const btnSend  = btn.querySelector('.btn-sending');
  const success  = document.getElementById('form-success');
  const fail     = document.getElementById('form-fail');

  success.hidden = true;
  fail.hidden = true;
  btn.disabled = true;
  btnText.hidden = true;
  btnSend.hidden = false;

  const accessKey = form.querySelector('input[name="access_key"]').value;
  const keyIsSet = accessKey && !accessKey.startsWith('REPLACE_WITH');

  const done = ok => {
    btn.disabled = false;
    btnText.hidden = false;
    btnSend.hidden = true;
    if (ok) {
      form.reset();
      success.hidden = false;
      setTimeout(() => { success.hidden = true; }, 8000);
    } else {
      fail.hidden = false;
    }
  };

  // If no Web3Forms key is configured yet, fall back to the visitor's email client.
  if (!keyIsSet) {
    const subject = encodeURIComponent(document.getElementById('subject').value.trim());
    const body = encodeURIComponent(
      `From: ${document.getElementById('name').value.trim()} <${document.getElementById('email').value.trim()}>\n\n` +
      document.getElementById('message').value.trim()
    );
    window.location.href = `mailto:amyxtu@berkeley.edu?subject=${subject}&body=${body}`;
    done(true);
    return;
  }

  try {
    const res = await fetch(form.action, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form)
    });
    const data = await res.json();
    done(res.ok && data.success);
  } catch (err) {
    done(false);
  }
});

// ── Project detail modal ───────────────────────
// To add a project: add an entry here, then add a matching card in index.html
//   with data-project="<key>" and an <img src="assets/<key>.png">.
// To show a "Live Demo" button, set `demo` to your deployed URL (e.g. a free
//   Streamlit Community Cloud link); leave it '' to show only "View Code".
const PROJECTS = {
  chess: {
    index: '01',
    image: 'assets/chess.png',
    title: 'Chess Strategy Analyzer',
    tags: ['Python', 'SQL (SQLite)', 'OpenAI API', 'Stockfish', 'Streamlit', 'python-chess'],
    overview: 'An AI chess coach built with Python and Streamlit. Upload a PGN game and it runs Stockfish evaluations on every move, flags blunders automatically, and turns the analysis into plain-English coaching with GPT-4o-mini, saving every analysis so you can revisit it later.',
    features: [
      'Parses PGN files exported from Lichess, Chess.com, or any standard source',
      'Move-by-move evaluation with the Stockfish engine',
      'Automatic blunder detection with a configurable threshold',
      'AI game summary, key moments, and improvement tips',
      'SQLite history with a sidebar to review past analyses'
    ],
    github: 'https://github.com/amyxtu/chess-strategy-analyzer',
    demo: ''
  },
  restaurant: {
    index: '02',
    image: 'assets/restaurant.png',
    title: 'Restaurant Recommender',
    tags: ['Python', 'SQL (SQLite)', 'Yelp API', 'OpenAI API', 'Streamlit', 'requests'],
    overview: 'An AI restaurant-discovery app. Enter your location, cuisine, budget, and occasion; it queries the Yelp Fusion API for real-time results, then uses GPT-4o-mini to rank them and explain, in one sentence each, why they fit what you asked for.',
    features: [
      'Live restaurant search via the Yelp Fusion API',
      'Filters by cuisine, budget ($ to $$$$), and open-now status',
      'AI ranking with personalized one-sentence explanations',
      'Handles dietary-restriction notes',
      'SQLite history to revisit past searches'
    ],
    github: 'https://github.com/amyxtu/restaurant-recommender',
    demo: ''
  }
};

const GH_ICON = '<svg width="15" height="15" style="margin-right:8px" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>';

const LIVE_ICON = '<svg width="15" height="15" style="margin-right:8px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';

const modal      = document.getElementById('project-modal');
const modalClose = document.getElementById('modal-close');
let lastFocused  = null;

function openProject(id) {
  const p = PROJECTS[id];
  if (!p) return;
  lastFocused = document.activeElement;

  const hero = document.getElementById('modal-hero');
  hero.style.backgroundImage = p.image ? `url('${p.image}')` : '';
  document.getElementById('modal-index').textContent = p.index;
  document.getElementById('modal-title').textContent = p.title;
  document.getElementById('modal-overview').textContent = p.overview;
  document.getElementById('modal-tags').innerHTML =
    p.tags.map(t => `<span>${t}</span>`).join('');
  document.getElementById('modal-features').innerHTML =
    p.features.map(f => `<li>${f}</li>`).join('');
  let links = '';
  if (p.demo) {
    links += `<a href="${p.demo}" target="_blank" rel="noopener" class="btn btn-primary">${LIVE_ICON}Live Demo</a>`;
    links += `<a href="${p.github}" target="_blank" rel="noopener" class="btn btn-secondary">${GH_ICON}View Code</a>`;
  } else {
    links += `<a href="${p.github}" target="_blank" rel="noopener" class="btn btn-primary">${GH_ICON}View Code</a>`;
  }
  document.getElementById('modal-links').innerHTML = links;

  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => modal.classList.add('open'));
  modal.scrollTop = 0;
  modalClose.focus();
}

function closeProject() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { modal.hidden = true; }, 280);
  if (lastFocused) lastFocused.focus();
}

document.querySelectorAll('.project-card').forEach(card => {
  const open = () => openProject(card.dataset.project);
  card.addEventListener('click', open);
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
  });
});

modalClose.addEventListener('click', closeProject);
modal.addEventListener('click', e => { if (e.target === modal) closeProject(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !modal.hidden) closeProject();
});
