// Zdarzenia dla Google Tag Manager. Wszystko idzie do window.dataLayer.
// Nazwy zdarzen: click_tel, click_whatsapp, click_email, copy_email,
// form_start, form_step, form_submit, form_error, calculator_result, calculator_lead,
// add_to_cart, purchase, cookie_consent.

export function track(event, params = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}

function placeOf(el) {
  const node = el.closest('[data-cta]');
  return node ? node.getAttribute('data-cta') : 'nieokreslone';
}

export function initClickTracking() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a, button');
    if (!link) return;
    const href = link.getAttribute('href') || '';

    if (link.hasAttribute('data-copy')) {
      const value = link.getAttribute('data-copy');
      if (navigator.clipboard) {
        navigator.clipboard.writeText(value).then(() => {
          track('copy_email', { email: value, cta: placeOf(link) });
          const old = link.textContent;
          link.textContent = 'Skopiowano';
          setTimeout(() => { link.textContent = old; }, 2000);
        });
      }
      return;
    }

    if (href.startsWith('tel:')) {
      track('click_tel', { phone: href.replace('tel:', ''), cta: placeOf(link) });
      return;
    }
    if (href.includes('wa.me')) {
      track('click_whatsapp', { cta: placeOf(link) });
      return;
    }
    if (href.startsWith('mailto:')) {
      track('click_email', { email: href.replace('mailto:', ''), cta: placeOf(link) });
      return;
    }
    if (href.startsWith('/sklep/') && link.classList.contains('btn')) {
      track('view_product', { product: href, cta: placeOf(link) });
    }
  });
}

export function sourceData() {
  try {
    return JSON.parse(sessionStorage.getItem('ef_source') || '{}');
  } catch (e) {
    return {};
  }
}