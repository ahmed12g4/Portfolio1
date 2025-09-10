// ===== Theme Toggle =====
const themeToggle = document.getElementById("themeToggle");
const root = document.documentElement;
const prefer = window.matchMedia("(prefers-color-scheme: light)").matches
  ? "light"
  : "dark";
const saved = localStorage.getItem("theme");
if (saved) document.documentElement.setAttribute("data-theme", saved);
themeToggle.addEventListener("click", () => {
  const cur = document.documentElement.getAttribute("data-theme") || prefer;
  const next = cur === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
});

// ===== IntersectionObserver for reveals =====
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in-view");
        // Animate meters when visible
        e.target.querySelectorAll("[data-meter]")?.forEach((bar) => {
          const v = bar.getAttribute("data-meter");
          bar.style.width = v + "%";
        });
        // Counters
        e.target
          .querySelectorAll("[data-counter]")
          ?.forEach((el) => animateCounter(el));
        // Stagger containers
        if (e.target.classList.contains("stagger")) {
          e.target.classList.add("in-view");
        }
      }
    });
  },
  { threshold: 0.15 }
);

document
  .querySelectorAll("[data-anim], .reveal, .stagger")
  .forEach((el) => io.observe(el));

// ===== Counter animation =====
function animateCounter(el) {
  const end = +el.getAttribute("data-counter");
  const start = 0;
  const dur = 1400;
  const t0 = performance.now();
  function tick(t) {
    const p = Math.min((t - t0) / dur, 1);
    const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p; // easeInOut
    el.textContent = Math.round(start + (end - start) * ease);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ===== Simple slider =====
const slides = document.getElementById("slides");
const prev = document.getElementById("prev");
const next = document.getElementById("next");
let i = 0;
function updateSlider() {
  slides.style.transform = `translateX(${
    -i *
    (slides.firstElementChild.getBoundingClientRect().width +
      parseFloat(getComputedStyle(slides).gap))
  }px)`;
}
next.addEventListener("click", () => {
  i = (i + 1) % slides.children.length;
  updateSlider();
});
prev.addEventListener("click", () => {
  i = (i - 1 + slides.children.length) % slides.children.length;
  updateSlider();
});
window.addEventListener("resize", updateSlider);

// ===== Tilt effect on project cards =====
document.querySelectorAll(".tilt").forEach((card) => {
  const rect = () => card.getBoundingClientRect();
  card.addEventListener("mousemove", (e) => {
    const r = rect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(800px) rotateX(${(-y * 6).toFixed(
      2
    )}deg) rotateY(${(x * 8).toFixed(2)}deg) translateZ(0)`;
  });
  card.addEventListener(
    "mouseleave",
    () => (card.style.transform = "perspective(800px) rotateX(0) rotateY(0)")
  );
});

// ===== Back to top visibility =====
const btt = document.getElementById("backToTop");
window.addEventListener("scroll", () => {
  btt.classList.toggle("visible", window.scrollY > 700);
});

// ===== Year =====
document.getElementById("year").textContent = new Date().getFullYear();

// ===== Background particles (lightweight) =====
const c = document.getElementById("bg-canvas");
const ctx = c.getContext("2d");
let w, h, dpr;
const dots = Array.from({ length: 70 }, () => ({
  x: Math.random(),
  y: Math.random(),
  vx: (Math.random() - 0.5) * 0.0006,
  vy: (Math.random() - 0.5) * 0.0006,
}));

function resize() {
  dpr = Math.min(2, window.devicePixelRatio || 1);
  w = c.width = innerWidth * dpr;
  h = c.height = innerHeight * dpr;
  c.style.width = innerWidth + "px";
  c.style.height = innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resize);
resize();

function draw() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  const theme =
    document.documentElement.getAttribute("data-theme") ||
    (window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark");
  ctx.fillStyle =
    theme === "light" ? "rgba(99,102,241,0.14)" : "rgba(106,227,255,0.12)";
  ctx.strokeStyle =
    theme === "light" ? "rgba(124,58,237,0.18)" : "rgba(106,227,255,0.2)";

  for (let i = 0; i < dots.length; i++) {
    const p = dots[i];
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > 1) p.vx *= -1;
    if (p.y < 0 || p.y > 1) p.vy *= -1;
    const x = p.x * innerWidth,
      y = p.y * innerHeight;
    ctx.beginPath();
    ctx.arc(x, y, 2.2, 0, Math.PI * 2);
    ctx.fill();
    for (let j = i + 1; j < dots.length; j++) {
      const q = dots[j];
      const dx = (q.x - p.x) * innerWidth;
      const dy = (q.y - p.y) * innerHeight;
      const dist = Math.hypot(dx, dy);
      if (dist < 120) {
        ctx.globalAlpha = 1 - dist / 120;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(q.x * innerWidth, q.y * innerHeight);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  }
  requestAnimationFrame(draw);
}
draw();

// ===== Smooth anchor offset for sticky header =====
const header = document.querySelector(".site-header");
function offsetAnchor() {
  if (location.hash.length === 0) return;
  const el = document.querySelector(location.hash);
  if (!el) return;
  const y =
    el.getBoundingClientRect().top + window.scrollY - header.offsetHeight - 10;
  window.scrollTo({ top: y, behavior: "smooth" });
}
window.addEventListener("hashchange", offsetAnchor);


// ===== Hamburger toggle =====
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");

hamburger.addEventListener("click", () => {
  mobileMenu.classList.toggle("show");

  // animation to cross
  hamburger.classList.toggle("open");
});

// JS toggle
const toggleBtn = document.getElementById("themeToggle");
toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  toggleBtn.classList.toggle("dark");
});
