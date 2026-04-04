/* ============================================================
   Elly Kirwa — Motion & Interactivity Layer
   Scroll-reveal · Counters · Typewriter · Ripple · Parallax
   ============================================================ */

(function () {
  'use strict';

  /* ── 1. SCROLL-REVEAL ────────────────────────────────────── */
  // Tag elements with .ek-reveal to animate them on scroll
  function initScrollReveal() {
    const targets = document.querySelectorAll(
      '.card, .proj-card, .rp-pillar, .rp-project, .rp-grant, ' +
      '.rp-pub-list li, .rp-timeline-item, .explore-item, ' +
      '.about-entity, #hero-heading, h2, .rp-hero'
    );

    targets.forEach((el, i) => {
      el.classList.add('ek-reveal');
      // Stagger delay: every 3 siblings share the same delay bucket
      el.style.setProperty('--reveal-delay', `${(i % 4) * 80}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('ek-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.ek-reveal').forEach((el) => observer.observe(el));
  }

  /* ── 2. ANIMATED COUNTERS ────────────────────────────────── */
  // Elements with data-count="N" animate from 0 → N when visible
  function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = eased * target;
      el.textContent = prefix + (Number.isInteger(target) ? Math.round(value) : value.toFixed(1)) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => observer.observe(el));
  }

  /* ── 3. TYPEWRITER for .ek-type ────────────────────────── */
  function initTypewriter() {
    const el = document.querySelector('.ek-type');
    if (!el) return;
    const text = el.dataset.text || el.textContent;
    el.textContent = '';
    el.style.visibility = 'visible';

    let i = 0;
    const speed = 38; // ms per character
    function type() {
      if (i < text.length) {
        el.textContent += text[i++];
        setTimeout(type, speed + Math.random() * 20);
      } else {
        el.classList.add('ek-type-done');
      }
    }
    setTimeout(type, 600);
  }

  /* ── 4. RIPPLE effect on buttons & cards ─────────────────── */
  function createRipple(e) {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'ek-ripple-dot';
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
    el.style.position = 'relative';
    el.style.overflow = 'hidden';
    el.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  }

  function initRipple() {
    document.querySelectorAll(
      '.about-link, .btn, .pub-btn, a.proj-card, .rp-project, .rp-pillar, .card'
    ).forEach((el) => {
      el.addEventListener('click', createRipple);
    });
  }

  /* ── 5. NAVBAR shrink on scroll ──────────────────────────── */
  function initNavbarShrink() {
    const nav = document.querySelector('.navbar');
    if (!nav) return;
    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        nav.classList.add('ek-navbar-shrunk');
      } else {
        nav.classList.remove('ek-navbar-shrunk');
      }
    }, { passive: true });
  }

  /* ── 6. ACTIVE nav-link highlight ───────────────────────── */
  function initActiveNav() {
    const path = location.pathname.replace(/\/$/, '');
    document.querySelectorAll('.navbar .nav-link').forEach((a) => {
      const href = a.getAttribute('href') || '';
      if (href && path.endsWith(href.replace(/^\.\//, '').replace(/\/$/, ''))) {
        a.classList.add('ek-nav-active');
      }
    });
  }

  /* ── 7. SMOOTH progress bars for skills (CV page) ──────── */
  function initSkillBars() {
    document.querySelectorAll('.ek-skill-bar').forEach((bar) => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            bar.style.setProperty('--bar-width', bar.dataset.level || '80%');
            bar.classList.add('ek-bar-animated');
            observer.unobserve(bar);
          }
        });
      }, { threshold: 0.4 });
      observer.observe(bar);
    });
  }

  /* ── 8. STAT numbers on research/index hero ─────────────── */
  function tagResearchStats() {
    // Auto-tag the stat .num spans on the research page hero
    document.querySelectorAll('.rp-stat .num').forEach((el) => {
      const raw = el.textContent.trim();
      const match = raw.match(/^(\$?)(\d+(?:\.\d+)?)(K?\+?)$/);
      if (match) {
        el.dataset.prefix = match[1];
        el.dataset.count  = match[2];
        el.dataset.suffix = match[3];
        el.textContent = match[1] + '0' + match[3];
      }
    });
  }

  /* ── 9. FLOATING particles (subtle background dots) ─────── */
  function initParticles() {
    const hero = document.querySelector('.rp-hero, .ek-hero-banner, #hero-heading');
    if (!hero) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;opacity:0.18;border-radius:inherit;';
    hero.style.position = 'relative';
    hero.insertBefore(canvas, hero.firstChild);

    const ctx = canvas.getContext('2d');
    let W, H, dots;

    function resize() {
      W = canvas.width  = hero.offsetWidth;
      H = canvas.height = hero.offsetHeight;
    }

    function makeDots() {
      dots = Array.from({ length: Math.min(28, Math.floor(W / 30)) }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 1.5 + Math.random() * 2.5,
        dx: (Math.random() - 0.5) * 0.35,
        dy: (Math.random() - 0.5) * 0.35,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#ffffff';
      dots.forEach((d) => {
        d.x += d.dx; d.y += d.dy;
        if (d.x < 0) d.x = W;
        if (d.x > W) d.x = 0;
        if (d.y < 0) d.y = H;
        if (d.y > H) d.y = 0;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }

    resize();
    makeDots();
    draw();
    window.addEventListener('resize', () => { resize(); makeDots(); }, { passive: true });
  }

  /* ── INIT ─────────────────────────────────────────────────── */
  function init() {
    tagResearchStats();
    initScrollReveal();
    initCounters();
    initTypewriter();
    initRipple();
    initNavbarShrink();
    initActiveNav();
    initSkillBars();
    initParticles();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
