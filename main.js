/* MathScienceDojo — motion engine
   1. Lerp smooth scrolling (desktop, pointer:fine only)
   2. Page transition veil between pages
   3. Scroll reveals (IntersectionObserver)
   4. Count-up score animations
   5. Light parallax
*/
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ---------- page enter ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("veil-leave");
    requestAnimationFrame(() => document.body.classList.add("page-ready"));
  });

  /* ---------- page transition veil ---------- */
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    const href = a.getAttribute("href") || "";
    const internal =
      href.endsWith(".html") &&
      !href.startsWith("http") &&
      !href.startsWith("#") &&
      a.target !== "_blank";
    if (!internal || reduceMotion) return;
    e.preventDefault();
    document.body.classList.remove("veil-leave");
    document.body.classList.add("veil-enter");
    setTimeout(() => { window.location.href = href; }, 580);
  });
  // restore state when navigating back (bfcache)
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) {
      document.body.classList.remove("veil-enter");
      document.body.classList.add("veil-leave", "page-ready");
    }
  });

  /* ---------- nav ---------- */
  const nav = document.querySelector(".nav");
  const burger = document.querySelector(".nav-burger");
  const links = document.querySelector(".nav-links");
  if (burger && links) {
    burger.addEventListener("click", () => {
      links.classList.toggle("open");
      document.body.classList.toggle("menu-open");
    });
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        links.classList.remove("open");
        document.body.classList.remove("menu-open");
      })
    );
  }

  /* ---------- smooth scroll (lerp) ---------- */
  const content = document.getElementById("smooth");
  let smoothOn = false;
  let current = 0, target = 0, raf = null;
  const LERP = 0.085;

  function setSpacer() {
    const spacer = document.getElementById("scroll-spacer");
    if (spacer && content) spacer.style.height = content.scrollHeight + "px";
  }

  function loop() {
    target = window.scrollY;
    current += (target - current) * LERP;
    if (Math.abs(target - current) < 0.05) current = target;
    content.style.transform = "translate3d(0," + -current + "px,0)";
    updateNav(current);
    updateParallax(current);
    raf = requestAnimationFrame(loop);
  }

  function updateNav(y) {
    if (nav) nav.classList.toggle("scrolled", y > 40);
  }

  /* ---------- parallax ---------- */
  const pxEls = [];
  function collectParallax() {
    pxEls.length = 0;
    document.querySelectorAll("[data-parallax]").forEach((el) => {
      pxEls.push({ el, speed: parseFloat(el.dataset.parallax) || 0.15 });
    });
  }
  function updateParallax(y) {
    for (const p of pxEls) {
      const r = p.el.getBoundingClientRect();
      const mid = r.top + r.height / 2 - window.innerHeight / 2;
      p.el.style.transform = "translate3d(0," + (-mid * p.speed).toFixed(1) + "px,0)";
    }
  }

  if (content && finePointer && !reduceMotion) {
    document.body.classList.add("has-smooth");
    smoothOn = true;
    setSpacer();
    // keep spacer in sync with content (images loading, accordions)
    const ro = new ResizeObserver(setSpacer);
    ro.observe(content);
    window.addEventListener("load", setSpacer);
    collectParallax();
    raf = requestAnimationFrame(loop);
    // anchor links: scroll the window, lerp follows
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href").slice(1);
        const t = document.getElementById(id);
        if (!t) return;
        e.preventDefault();
        const y = t.getBoundingClientRect().top + current - 90;
        window.scrollTo({ top: y, behavior: "smooth" });
      });
    });
  } else {
    // mobile / reduced motion: native scroll, still update nav + parallax
    collectParallax();
    window.addEventListener("scroll", () => {
      updateNav(window.scrollY);
      if (!reduceMotion) updateParallax(window.scrollY);
    }, { passive: true });
    updateNav(window.scrollY);
  }

  /* ---------- reveals ---------- */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("in-view");
          if (en.target.hasAttribute("data-count")) countUp(en.target);
          en.target.querySelectorAll("[data-count]").forEach(countUp);
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -6% 0px" }
  );
  document
    .querySelectorAll("[data-reveal], .stagger, .hero, .page-hero, [data-count-group]")
    .forEach((el) => io.observe(el));

  /* ---------- count up ---------- */
  const counted = new WeakSet();
  function countUp(el) {
    if (counted.has(el)) return;
    counted.add(el);
    const end = parseInt(el.dataset.count, 10);
    const dur = 1400;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * eased);
      if (p < 1) requestAnimationFrame(tick);
    }
    if (reduceMotion) { el.textContent = end; return; }
    requestAnimationFrame(tick);
  }

  /* ---------- footer year ---------- */
  const yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();
})();
