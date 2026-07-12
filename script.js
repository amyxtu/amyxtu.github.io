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
  '#about .container > *, #experience .container > *, #leadership .container > *, #projects .container > *, #contact .container > *, .project-card, .timeline-item, .about-photo, .about-text, .contact-info, .contact-form'
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

// ── Typed greeting in the hero ──────────────────
const typedEl = document.getElementById('typed');
if (typedEl) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const text = "hi, i'm";
  if (reduce) {
    typedEl.textContent = text;
  } else {
    let i = 0;
    const tick = () => {
      typedEl.textContent = text.slice(0, i);
      if (i <= text.length) { i++; setTimeout(tick, 95); }
    };
    setTimeout(tick, 400);
  }
}
