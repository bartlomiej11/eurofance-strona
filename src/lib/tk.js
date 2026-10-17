import prices from '../data/prices.json';
import site from '../data/site.json';

// Podmiana tokenow w tresci. Tokeny: {cena}, {telefon}, {gwarancja}, {ocena}, {liczba_opinii} itd.
// Ceny pochodza z src/data/prices.json, dane firmy z src/data/site.json.
const map = {
  ...prices.values,
  ...prices.examples,
  telefon: site.phone.display,
  telefon_short: site.phone.short,
  telefon_link: site.phone.tel,
  whatsapp: site.whatsapp.display,
  email: site.email,
  gwarancja: site.warranty,
  ocena: site.googleRating.value,
  liczba_opinii: String(site.googleRating.count),
  godziny: site.hours.line,
  miasto_produkcji: site.address.city,
  miasto_produkcji_w: site.address.cityLocative || site.address.city,
  czas_odpowiedzi: site.stats.responseTime,
  czas_produkcji: site.stats.productionDays,
  czas_montazu: site.stats.montageDays,
  czas_pomiaru: site.stats.pomiarDays,
  czas_dostawy: site.stats.deliveryDays,
  lata: String(site.stats.years),
  realizacje: String(site.stats.realizacje),
  ekipy: String(site.stats.teams),
  km_rocznie: String(site.stats.kmPerYear),
  aktualizacja: prices.updated,
};

const TOKEN = /\{([a-z0-9_]+)\}/gi;

export function tk(value) {
  if (value === null || value === undefined) return '';
  if (typeof value !== 'string') return value;
  return value.replace(TOKEN, (full, key) => {
    const k = key.toLowerCase();
    return Object.prototype.hasOwnProperty.call(map, k) ? map[k] : full;
  });
}

// Rekurencyjna podmiana w całym obiekcie (uzywana przy danych produktow i JSON-LD).
export function tkDeep(value) {
  if (typeof value === 'string') return tk(value);
  if (Array.isArray(value)) return value.map(tkDeep);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = tkDeep(v);
    return out;
  }
  return value;
}

export const priceMap = map;