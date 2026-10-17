import { initClickTracking } from './tracking.js';
import { initForms } from './forms.js';
import { initCalculators } from './calculator.js';
import { initUI } from './ui.js';
import { initShopFilters } from './shop.js';
import { initCart } from './cart.js';

function boot() {
  initClickTracking();
  initForms();
  initCalculators();
  initUI();
  initShopFilters();
  initCart();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

// Smartsupp: ladowany po 8 s albo po pierwszej interakcji, zeby nie spowalnial strony.
// Podmien klucz SMARTSUPP_KEY na wlasny przed wdrozeniem.
(function loadChat() {
  const KEY = '[KLUCZ SMARTSUPP]';
  if (KEY.indexOf('[') === 0) return;
  let loaded = false;
  function load() {
    if (loaded) return;
    loaded = true;
    const s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.src = `https://www.smartsuppchat.com/loader.js?key=${KEY}`;
    document.head.appendChild(s);
  }
  setTimeout(load, 8000);
  ['pointerdown', 'keydown', 'scroll'].forEach((event) => {
    window.addEventListener(event, load, { once: true, passive: true });
  });
})();