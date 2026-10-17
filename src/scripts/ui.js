import { track } from './tracking.js';

function initNav() {
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.getElementById('nav-glowna');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

function initGallery() {
  const filters = document.querySelector('[data-gallery-filters]');
  const gallery = document.querySelector('[data-gallery]');
  if (!filters || !gallery) return;
  filters.addEventListener('click', (e) => {
    const button = e.target.closest('button[data-filter]');
    if (!button) return;
    const value = button.getAttribute('data-filter');
    filters.querySelectorAll('button').forEach((b) => b.classList.toggle('is-active', b === button));
    gallery.querySelectorAll('figure').forEach((figure) => {
      const tags = figure.getAttribute('data-tags') || '';
      figure.hidden = value !== 'wszystkie' && !tags.includes(value);
    });
    track('gallery_filter', { filter: value });
  });
}

function initHeroVariant() {
  const holder = document.querySelector('[data-hero-variant]');
  const configEl = document.getElementById('hero-variants');
  if (!holder || !configEl) return;
  const key = new URLSearchParams(window.location.search).get('h');
  if (!key) return;
  const config = JSON.parse(configEl.textContent);
  const variant = config.map[key];
  if (!variant) return;
  const sub = document.querySelector('[data-hero-sub]');
  const cta = document.querySelector('[data-hero-cta]');
  if (sub && variant.sub) sub.textContent = variant.sub;
  if (cta && variant.cta) cta.textContent = variant.cta;
}

function initVideos() {
  document.querySelectorAll('[data-video]').forEach((box) => {
    const play = box.querySelector('[data-video-play]');
    const video = box.querySelector('video');

    // Wariant 1: odtwarzacz ukryty w znaczniku, odslaniany po kliknieciu.
    if (play && video) {
      play.addEventListener('click', () => {
        video.preload = 'auto';
        const src = video.getAttribute('data-src');
        if (src) video.setAttribute('src', src);
        // Plakat i przycisk znikaja, odtwarzacz zajmuje ich miejsce.
        const plakat = box.querySelector('img');
        if (plakat) {
          plakat.hidden = true;
          plakat.style.display = 'none';
        }
        video.hidden = false;
        play.hidden = true;
        const start = video.play();
        if (start && typeof start.catch === 'function') start.catch(() => {});
        track('video_play', { name: box.getAttribute('data-video') });
      });
      return;
    }

    // Wariant 2: fasada z miniatura - odtwarzacz powstaje dopiero po kliknieciu,
    // dzieki czemu film nie obciaza pierwsze wczytanie strony.
    const trigger = box.querySelector('[data-video-trigger]');
    if (!trigger) return;

    const zbudujGracz = () => {
      const frame = box.querySelector('.video__frame');
      if (!frame) return null;
      const plik = box.getAttribute('data-src');
      const embed = box.getAttribute('data-embed');
      const napisy = box.getAttribute('data-captions');

      if (embed) {
        const ramka = document.createElement('iframe');
        ramka.src = embed;
        ramka.title = box.getAttribute('data-name') || 'Film';
        ramka.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        ramka.setAttribute('allowfullscreen', '');
        ramka.loading = 'eager';
        frame.appendChild(ramka);
        return null;
      }

      if (!plik) return null;
      const v = document.createElement('video');
      v.controls = true;
      v.playsInline = true;
      v.preload = 'auto';
      v.className = 'video__player';
      const poster = box.getAttribute('data-poster');
      if (poster) v.poster = poster;
      const zrodlo = document.createElement('source');
      zrodlo.src = plik;
      zrodlo.type = 'video/mp4';
      v.appendChild(zrodlo);
      if (napisy) {
        const tor = document.createElement('track');
        tor.kind = 'captions';
        tor.label = 'Polski';
        tor.srclang = 'pl';
        tor.src = napisy;
        tor.default = true;
        v.appendChild(tor);
      }
      frame.appendChild(v);
      return v;
    };

    trigger.addEventListener('click', () => {
      const gracz = zbudujGracz();
      const frame = box.querySelector('.video__frame');
      frame?.querySelector('.video__poster')?.remove();
      trigger.hidden = true;
      box.classList.add('is-playing');
      if (gracz) {
        const p = gracz.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      }
      track('video_play', { name: box.getAttribute('data-name') || '' });
    });
  });

  // Kluczowe momenty: przewijanie do wskazanej sekundy, w razie potrzeby po
  // uprzednim uruchomieniu odtwarzacza.
  document.querySelectorAll('[data-seek]').forEach((button) => {
    button.addEventListener('click', () => {
      const box = button.closest('[data-video]');
      if (!box) return;
      const sekunda = Number(button.getAttribute('data-seek')) || 0;
      const przewin = () => {
        const v = box.querySelector('video');
        if (v) {
          v.currentTime = sekunda;
          const p = v.play();
          if (p && typeof p.catch === 'function') p.catch(() => {});
        }
      };
      if (box.querySelector('video')) {
        przewin();
        box.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        box.querySelector('[data-video-trigger]')?.click();
        setTimeout(przewin, 350);
      }
      track('video_moment', { second: sekunda });
    });
  });
}

function initCopy() {
  document.querySelectorAll('[data-copy]').forEach((button) => {
    button.addEventListener('click', () => {
      const value = button.getAttribute('data-copy');
      if (navigator.clipboard) navigator.clipboard.writeText(value);
    });
  });
}

export function initUI() {
  initNav();
  initGallery();
  initHeroVariant();
  initVideos();
  initHeaderScroll();
  initReveal();
  initCopy();
}

// Naglowek: delikatne przyciemnienie i cien po przewinieciu strony.
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const ustaw = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
  ustaw();
  window.addEventListener('scroll', ustaw, { passive: true });
}

// Animacje wejscia: tylko dla elementow ponizej pierwszej strony ekranu,
// zeby nic nie migalo przy wczytaniu. Respektuje prefers-reduced-motion.
function initReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  const wybor = [
    '.card', '.tile', '.photo-card', '.stat', '.gallery figure', '.reel', '.video',
    '.steps li', '.table-wrap', '.cta-bar', '.note-box', '.keyfacts', '.post-card',
    '.video-card', '.choice', '.price-row',
  ].join(', ');

  const elementy = Array.from(document.querySelectorAll(wybor)).filter((el) => {
    if (el.closest('[data-video]')) return false;
    const prostokat = el.getBoundingClientRect();
    return prostokat.top > window.innerHeight * 0.92;
  });
  if (!elementy.length) return;

  const obserwator = new IntersectionObserver(
    (wpisy) => {
      wpisy.forEach((wpis) => {
        if (!wpis.isIntersecting) return;
        const el = wpis.target;
        const opoznienie = Number(el.getAttribute('data-reveal-delay') || 0);
        setTimeout(() => el.classList.add('is-in'), opoznienie);
        obserwator.unobserve(el);
      });
    },
    { rootMargin: '0px 0px -6% 0px', threshold: 0.04 }
  );

  elementy.forEach((el) => {
    const rodzenstwo = el.parentElement ? Array.from(el.parentElement.children).indexOf(el) : 0;
    el.setAttribute('data-reveal-delay', String(Math.min(rodzenstwo, 4) * 70));
    el.classList.add('reveal');
    obserwator.observe(el);
  });
  // Zabezpieczenie: gdyby obserwator nie zadzialal (np. blokada skryptow, wolne lacze),
  // po 2,5 s odslaniamy wszystko, zeby zaden blok nie zostal pusty.
  setTimeout(() => elementy.forEach((el) => el.classList.add('is-in')), 2500);
}



// Rolki: odtwarzanie w oknie na srodku ekranu (bez przewijania strony).
(function () {
  const modal = document.querySelector('[data-reel-modal]');
  if (!modal) return;
  const wideo = modal.querySelector('[data-reel-modal-video]');
  const opis = modal.querySelector('[data-reel-modal-meta]');

  function zamknij() {
    modal.classList.remove('is-open');
    modal.hidden = true;
    document.body.style.overflow = '';
    if (wideo) {
      wideo.pause();
      wideo.removeAttribute('src');
      if (typeof wideo.load === 'function') wideo.load();
    }
  }

  function otworz(karta) {
    const zrodlo = karta.querySelector('video.reel__video');
    if (!zrodlo || !wideo) return;
    modal.hidden = false;
    modal.classList.add('is-open');
    wideo.setAttribute('poster', zrodlo.getAttribute('poster') || '');
    wideo.setAttribute('src', zrodlo.getAttribute('data-src') || '');
    const tytul = karta.querySelector('figcaption strong');
    if (opis) opis.textContent = tytul ? tytul.textContent : '';
    document.body.style.overflow = 'hidden';
    const start = wideo.play();
    if (start && typeof start.catch === 'function') start.catch(() => {});
  }

  document.addEventListener('click', (event) => {
    const przycisk = event.target.closest('[data-reel-play]');
    if (przycisk) {
      event.preventDefault();
      const karta = przycisk.closest('[data-reel]');
      if (karta) otworz(karta);
      return;
    }
    if (event.target.closest('[data-reel-close]')) {
      event.preventDefault();
      zamknij();
    }
  }, false);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) zamknij();
  });
})();
