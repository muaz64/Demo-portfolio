/* ========= Helper functions ========= */
const qs = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* ========= 1) Theme toggle with persistence (Bootstrap 5.3+ compatible) ========= */
const html = document.documentElement;
const themeToggle = qs("#theme-toggle");

const setTheme = (theme) => {
  html.setAttribute("data-bs-theme", theme);
  localStorage.setItem("theme", theme);
  themeToggle.textContent = theme === "dark" ? "🌙" : "☀️";
};

(() => {
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  setTheme(savedTheme || (prefersDark ? "dark" : "light"));
})();

themeToggle.addEventListener("click", () => {
  const currentTheme = html.getAttribute("data-bs-theme");
  setTheme(currentTheme === "dark" ? "light" : "dark");
});

/* ========= 2) Active link on scroll (IntersectionObserver) ========= */
const navLinks = qsa(".nav-link");
const sections = ["home", "about", "projects", "contact"].map(id => qs("#" + id));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(a =>
          a.classList.toggle("active", a.getAttribute("href") === "#" + id)
        );
      }
    });
  }, { rootMargin: "-35% 0px -55% 0px", threshold: 0.1 }
);
sections.forEach(sec => observer.observe(sec));


/* ========= 3) Reveal-on-scroll ========= */
const reveals = qsa(".reveal");
const revealObs = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("on");
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 }
);
reveals.forEach(el => revealObs.observe(el));

/* ========= 4) Project filters ========= */
const chips = qsa(".chip");
const cards = qsa(".project");
chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    chips.forEach((c) => {
      c.classList.toggle("active", c === chip);
      c.setAttribute("aria-selected", c === chip);
    });
    const filter = chip.dataset.filter;
    cards.forEach((card) => {
      const match = filter === "all" || card.dataset.category === filter;
      card.classList.toggle("hidden", !match);
    });
  });
});

/* ========= 5) Modal preview (Bootstrap 5 Modal) ========= */
const projectModalEl = qs("#project-modal");
const projectModal = new bootstrap.Modal(projectModalEl);

qsa(".preview-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".project");
    const title = card.dataset.title || "Project";
    const desc = card.dataset.desc || "";
    const demoUrl = card.dataset.demo;
    const codeUrl = card.dataset.code;

    qs("#modal-title", projectModalEl).textContent = title;
    qs("#modal-desc", projectModalEl).textContent = desc;

    const demoBtn = qs("#modal-demo", projectModalEl);
    demoBtn.style.display = demoUrl ? "inline-flex" : "none";
    if (demoUrl) demoBtn.href = demoUrl;

    const codeBtn = qs("#modal-code", projectModalEl);
    codeBtn.style.display = codeUrl ? "inline-flex" : "none";
    if (codeUrl) codeBtn.href = codeUrl;

    projectModal.show();
  });
});

/* ========= 6) Contact form (validation + mailto) ========= */
const CONTACT_EMAIL = "muazmuhammad21@gmail.com";
const form = qs("#contact-form");
const statusEl = qs("#form-status");
const toastEl = qs('#toast');
const toast = new bootstrap.Toast(toastEl);
const liveMailto = qs("#live-mailto");

const emailValid = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const buildMailto = ({ name, email, message }) => {
  const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
};

const updateLiveMailto = () => {
  const name = qs("#name").value.trim() || "Friend";
  const email = qs("#email").value.trim() || "";
  const message = qs("#message").value.trim() || "";
  liveMailto.href = buildMailto({ name, email, message });
};
["input", "change", "keyup"].forEach(ev =>
  ["#name", "#email", "#message"].forEach(id => qs(id).addEventListener(ev, updateLiveMailto))
);
updateLiveMailto();

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = qs("#name").value.trim();
  const email = qs("#email").value.trim();
  const message = qs("#message").value.trim();
  const website = qs("#website").value.trim(); // honeypot

  if (website) {
    statusEl.textContent = "Spam detected.";
    return;
  }
  if (name.length < 2) {
    statusEl.textContent = "Please enter your full name.";
    return;
  }
  if (!emailValid(email)) {
    statusEl.textContent = "Please enter a valid email.";
    return;
  }
  if (message.length < 10) {
    statusEl.textContent = "Message is too short.";
    return;
  }

  const href = buildMailto({ name, email, message });
  toast.show();
  window.location.href = href;
  statusEl.textContent = "Your email app should open now. If not, email me directly.";

  setTimeout(() => {
    form.reset();
    updateLiveMailto();
  }, 400);
});

/* ========= 7) Footer year ========= */
qs("#year").textContent = new Date().getFullYear();