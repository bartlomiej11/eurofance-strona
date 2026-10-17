import { track, sourceData } from './tracking.js';

const STORE_KEY = 'ef_form_values';

function readStore() {
  try {
    return JSON.parse(sessionStorage.getItem(STORE_KEY) || '{}');
  } catch (e) {
    return {};
  }
}

function writeStore(data) {
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(data));
  } catch (e) {}
}

function phoneDigits(value) {
  return (value || '').replace(/[^\d]/g, '');
}

function validateField(input) {
  const field = input.closest('.field') || input.closest('.form__consent');
  if (!field) return true;
  let ok = true;
  const value = (input.value || '').trim();

  if (input.hasAttribute('data-required') && value === '') ok = false;
  if (ok && input.hasAttribute('data-phone') && value !== '' && phoneDigits(value).length < 9) ok = false;
  if (ok && input.hasAttribute('data-email') && value !== '' && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value)) ok = false;
  if (input.hasAttribute('data-required-checkbox') && !input.checked) ok = false;

  field.classList.toggle('field--error', !ok);
  return ok;
}

function validateStep(form, step) {
  const fields = form.querySelector(`[data-step="${step}"]`).querySelectorAll('input, select, textarea');
  let ok = true;
  fields.forEach((input) => {
    if (input.type === 'hidden' || input.name === 'firma_x') return;
    if (!validateField(input)) ok = false;
  });
  return ok;
}

function showStep(form, step) {
  const last = Number(form.getAttribute('data-last-step') || 1);
  form.querySelectorAll('[data-step]').forEach((fs) => {
    fs.hidden = Number(fs.getAttribute('data-step')) !== step;
  });
  form.querySelectorAll('[data-step-label]').forEach((li) => {
    const n = Number(li.getAttribute('data-step-label'));
    li.classList.toggle('is-active', n === step);
    li.classList.toggle('is-done', n < step);
  });
  form.setAttribute('data-current-step', String(step));
  const first = form.querySelector(`[data-step="${step}"] input, [data-step="${step}"] select`);
  if (first) first.focus({ preventScroll: true });
  track('form_step', { step, form_type: form.getAttribute('data-mode'), cta: form.getAttribute('data-place') });
  return step <= last;
}

function fillHiddenFields(form) {
  const source = sourceData();
  form.querySelectorAll('[data-page-input]').forEach((el) => { el.value = window.location.pathname + window.location.search; });
  form.querySelectorAll('[data-landing-input]').forEach((el) => { el.value = source.landing || window.location.pathname; });
  form.querySelectorAll('[data-utm]').forEach((el) => { el.value = source[el.getAttribute('data-utm')] || ''; });
}

function collect(form) {
  const data = {};
  new FormData(form).forEach((value, key) => {
    if (value instanceof File) {
      if (value.name) data[key] = value.name;
      return;
    }
    if (data[key] === undefined) data[key] = value;
    else data[key] = `${data[key]}, ${value}`;
  });
  data.data_godzina = new Date().toISOString();
  data.jezyk = navigator.language;
  data.ekran = `${window.screen.width}x${window.screen.height}`;
  return data;
}

async function send(form, data) {
  const endpoint = form.getAttribute('data-endpoint');
  const payload = { ...data, _subject: `Wycena ze strony: ${data.formularz || 'formularz'}` };
  if (!endpoint || endpoint.includes('[')) {
    console.info('[Eurofance] Brak skonfigurowanego adresu wysyłki, dane formularza:', payload);
    return true;
  }
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response.ok;
}

export function initForms() {
  const forms = document.querySelectorAll('[data-lead-form]');
  forms.forEach((form) => {
    let started = false;
    let currentStep = 1;

    // Wczytanie zapisanych wartosci z sesji.
    const saved = readStore();
    Object.entries(saved).forEach(([name, value]) => {
      const el = form.querySelector(`[name="${name}"]`);
      if (!el || el.type === 'hidden' || el.type === 'file') return;
      if (el.type === 'radio') {
        const radio = form.querySelector(`[name="${name}"][value="${value}"]`);
        if (radio) radio.checked = true;
      } else {
        el.value = value;
      }
    });

    fillHiddenFields(form);
    form.addEventListener('focusin', () => {
      if (started) return;
      started = true;
      track('form_start', { form_type: form.getAttribute('data-mode'), cta: form.getAttribute('data-place') });
    });

    // Zapis wpisanych danych przy przejsciu na inna podstrone.
    form.addEventListener('input', () => {
      const data = {};
      form.querySelectorAll('input, select, textarea').forEach((el) => {
        if (!el.name || el.type === 'hidden' || el.type === 'file' || el.name === 'firma_x') return;
        if (el.type === 'radio') {
          if (el.checked) data[el.name] = el.value;
        } else if (el.type === 'checkbox') {
          if (el.checked) data[el.name] = 'tak';
        } else {
          data[el.name] = el.value;
        }
      });
      writeStore({ ...readStore(), ...data });
    });

    form.addEventListener('click', (e) => {
      const next = e.target.closest('[data-next]');
      const prev = e.target.closest('[data-prev]');
      if (next) {
        if (!validateStep(form, currentStep)) {
          track('form_error', { step: currentStep, form_type: form.getAttribute('data-mode') });
          return;
        }
        currentStep += 1;
        showStep(form, currentStep);
      }
      if (prev) {
        currentStep = Math.max(1, currentStep - 1);
        showStep(form, currentStep);
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const last = Number(form.getAttribute('data-last-step') || 1);
      if (!validateStep(form, last)) {
        track('form_error', { step: last, form_type: form.getAttribute('data-mode') });
        return;
      }
      if (form.querySelector('[name="firma_x"]') && form.querySelector('[name="firma_x"]').value !== '') return;

      const submit = form.querySelector('[data-submit]');
      if (submit) { submit.disabled = true; submit.textContent = 'Wysyłam...'; }

      const data = collect(form);
      const ok = await send(form, data);

      if (!ok) {
        track('form_error', { step: last, form_type: form.getAttribute('data-mode'), reason: 'serwer' });
        const err = form.querySelector('[data-form-err]');
        if (err) err.hidden = false;
        if (submit) { submit.disabled = false; submit.textContent = 'Wyślij i odbierz wycenę'; }
        return;
      }

      track('form_submit', {
        form_type: form.getAttribute('data-mode'),
        cta: form.getAttribute('data-place'),
        email: data.email || '',
        phone: data.telefon || '',
        kategoria: data.kategoria || data.zakres || '',
      });
      if (form.getAttribute('data-mode') === 'calculator') track('calculator_lead', { value: data.wycena_kalkulatora || '' });

      try { sessionStorage.removeItem(STORE_KEY); } catch (e) {}
      const thanks = form.getAttribute('data-thanks');
      const okBox = form.querySelector('[data-form-ok]');
      if (okBox) okBox.hidden = false;
      if (thanks) window.location.href = thanks;
    });
  });
}