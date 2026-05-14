// ── Year ──────────────────────────────────────
document.getElementById('year').textContent = new Date().getFullYear();

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
  '#about .container > *, #projects .container > *, #contact .container > *, .project-card, .about-photo, .about-text, .contact-info, .contact-form'
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
['name', 'email', 'subject', 'message'].forEach((f, i) => {
  clearOnInput(f, `${f}-error`);
});

form.addEventListener('submit', e => {
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

  btn.disabled = true;
  btnText.hidden = true;
  btnSend.hidden = false;

  // Simulate async submission (wire up to a real endpoint as needed)
  setTimeout(() => {
    btn.disabled = false;
    btnText.hidden = false;
    btnSend.hidden = true;
    form.reset();
    success.hidden = false;
    setTimeout(() => { success.hidden = true; }, 6000);
  }, 1400);
});
