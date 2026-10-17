import { track } from './tracking.js';

const fmt = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 });

function money(value) {
  return `${fmt.format(Math.round(value / 100) * 100)} zł`;
}

function calc(config, values) {
  const base = config.base[values.base] || { price: 0 };
  const height = config.height[values.height] || { factor: 1 };
  const gate = config.gate[values.gate] || { price: 0 };
  const wicket = config.wicket[values.wicket] || { price: 0 };
  const kerb = config.kerb[values.kerb] || { price: 0 };
  const mount = config.mount[values.mount] || { price: 0 };
  const drive = config.drive[values.drive] || { price: 0 };

  const length = Math.max(0, Number(String(values.length).replace(',', '.')) || 0);
  const perMb = base.price * height.factor + kerb.price + mount.price;
  const total = length * perMb + gate.price + wicket.price + drive.price;
  const low = Math.max(config.minValue || 0, total * (1 - (config.rangePercent || 15) / 100));
  const high = total * (1 + (config.rangePercent || 15) / 100);
  return { low, high, perMb, length, total };
}

export function initCalculators() {
  document.querySelectorAll('[data-calculator]').forEach((box) => {
    const configId = box.getAttribute('data-config-id');
    const configEl = document.getElementById(configId);
    if (!configEl) return;
    const config = JSON.parse(configEl.textContent);

    const resultBox = box.parentElement.querySelector('[data-calc-result]');
    const rangeOut = resultBox ? resultBox.querySelector('[data-calc-range]') : null;
    const detailOut = resultBox ? resultBox.querySelector('[data-calc-detail]') : null;
    const mirror = box.parentElement.querySelector('[data-calc-mirror]') || document.querySelector('[data-calc-mirror]');
    const fields = box.querySelectorAll('[data-calc]');
    let lastPush = 0;

    function read() {
      const values = {};
      fields.forEach((el) => { values[el.getAttribute('data-calc')] = el.value; });
      return values;
    }

    function update(trackResult = false) {
      const values = read();
      const out = calc(config, values);
      if (rangeOut) rangeOut.textContent = `od ${money(out.low)} do ${money(out.high)}`;
      if (detailOut) {
        detailOut.textContent = `${out.length ? `${out.length} mb, ` : ''}ok. ${money(out.perMb)} za metr bieżący z dodatkami. Cena zawiera materiał i montaż zgodnie z wyborem.`;
      }
      if (mirror) {
        mirror.value = `Kalkulator: ${config.base[values.base].label}, ${values.length} mb, wysokość ${config.height[values.height].label}, brama: ${config.gate[values.gate].label}, furtka: ${config.wicket[values.wicket].label}, podmurówka: ${config.kerb[values.kerb].label}, montaż: ${config.mount[values.mount].label}, napęd: ${config.drive[values.drive].label}. Wynik: od ${money(out.low)} do ${money(out.high)}.`;
      }
      if (trackResult) {
        const now = Date.now();
        if (now - lastPush > 1500) {
          lastPush = now;
          track('calculator_result', { value: Math.round(out.total), low: Math.round(out.low), high: Math.round(out.high), length: out.length });
        }
      }
    }

    fields.forEach((el) => {
      el.addEventListener('input', () => update(true));
      el.addEventListener('change', () => update(true));
    });
    update(false);
  });
}