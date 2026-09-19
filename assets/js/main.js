/* ==========================================================================
   BPS MAIN.JS — component loader, navigation, reveal, counters, back-to-top
   ========================================================================== */
(function () {
  "use strict";

  const ROOT = document.documentElement.getAttribute('data-root') || './';

  /* ---------- Component Include System (future PHP/CMS ready) ---------- */
  function loadComponents() {
    const nodes = document.querySelectorAll('[data-include]:not([data-loaded])');
    if (!nodes.length) return;
    nodes.forEach((el) => {
      const file = el.getAttribute('data-include');
      el.setAttribute('data-loaded', 'pending');
      fetch(ROOT + 'components/' + file)
        .then((res) => res.text())
        .then((html) => {
          el.innerHTML = html.replaceAll('{{ROOT}}', ROOT);
          el.setAttribute('data-loaded', 'true');
          document.dispatchEvent(new CustomEvent('bps:componentLoaded', { detail: { file, el } }));
          loadComponents(); // process any nested includes
          setActiveNav();
          initMegaHover();
          const y = document.getElementById('year');
          if (y) y.textContent = new Date().getFullYear();
          initBackToTop();
        })
        .catch((err) => console.error('BPS component load failed:', file, err));
    });
  }

  /* ---------- Global broken-image fallback ---------- */
  document.addEventListener('error', function (e) {
    if (e.target.tagName === 'IMG' && !e.target.dataset.fallback) {
      e.target.dataset.fallback = 'true';
      e.target.src = ROOT + 'assets/images/placeholder.svg';
    }
  }, true);

  /* ---------- Active nav highlighting ---------- */
  function setActiveNav() {
    const page = document.body.getAttribute('data-page');
    if (!page) return;
    document.querySelectorAll('.navbar-nav [data-page]').forEach((a) => {
      if (a.getAttribute('data-page') === page) {
        a.classList.add('active');
      }
    });
  }

  /* ---------- Mega menu hover on desktop ---------- */
  function initMegaHover() {
    if (window.innerWidth < 992) return;
    document.querySelectorAll('.nav-item.dropdown').forEach((item) => {
      const menu = item.querySelector('.dropdown-menu');
      const toggle = item.querySelector('.dropdown-toggle');
      if (!menu || item.dataset.hoverBound) return;
      item.dataset.hoverBound = 'true';
      item.addEventListener('mouseenter', () => {
        menu.classList.add('show');
        toggle?.setAttribute('aria-expanded', 'true');
      });
      item.addEventListener('mouseleave', () => {
        menu.classList.remove('show');
        toggle?.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Navbar shrink on scroll ---------- */
  window.addEventListener('scroll', function () {
    const nav = document.getElementById('mainNavbar');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
    const btt = document.getElementById('backToTop');
    if (btt) btt.classList.toggle('show', window.scrollY > 400);
  });

  function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn || btn.dataset.bound) return;
    btn.dataset.bound = 'true';
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ---------- Scroll Reveal ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  function initReveal() {
    document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
  }

  /* ---------- Animated Counters ---------- */
  function animateCounter(el) {
    const target = +el.getAttribute('data-count');
    let current = 0;
    const step = Math.max(target / 60, 1);
    const tick = () => {
      current += step;
      if (current < target) {
        el.textContent = Math.floor(current).toLocaleString();
        requestAnimationFrame(tick);
      } else {
        el.textContent = target.toLocaleString() + (el.getAttribute('data-suffix') || '');
      }
    };
    tick();
  }
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  function initCounters() {
    document.querySelectorAll('[data-count]').forEach((el) => counterObserver.observe(el));
  }

  document.addEventListener('DOMContentLoaded', function () {
    loadComponents();
    initReveal();
    initCounters();
    // re-scan for reveal elements added after JSON render
    document.addEventListener('bps:contentRendered', initReveal);
  });
})();