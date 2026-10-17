import media from '../data/media.json';
import { tk } from './tk.js';

// Miniatura z YouTube jako zapas, gdy klient nie dostarczy wlasnego plakatu.
const miniaturaYouTube = (value) => {
  const id = youtubeId(value);
  return id ? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg` : '';
};

// Uzupelnia wpis: domyslny rodzaj, plakat z YouTube, gdy brak wlasnego.
const normalizuj = (item, kind) => {
  const poster = item.poster || miniaturaYouTube(item.youtube);
  return {
    kind,
    ...item,
    poster,
    posterAlt: item.posterAlt || `${item.name} - ${item.city || 'realizacja Eurofance'}`,
    width: item.width || (kind === 'rolka' ? 1080 : 1920),
    height: item.height || (kind === 'rolka' ? 1920 : 1080),
  };
};

// Wszystkie filmy poziome z pliku danych.
export const videos = (media.videos || []).map((v) => normalizuj(v, 'wideo'));

// Wszystkie rolki pionowe.
export const reels = (media.reels || []).map((v) => normalizuj(v, 'rolka'));

// Filmy i rolki razem - do mapy witryny i danych strukturalnych.
export const allMedia = [...videos, ...reels];

// Adres strony filmu.
export const mediaUrl = (item) => `/wideo/${item.slug}`;

// Pojedynczy film po adresie.
export const getMedia = (slug) => allMedia.find((item) => item.slug === slug) || null;

// Pierwszy plik wideo z listy źródeł.
export const primarySource = (item) => (item.sources && item.sources[0] ? item.sources[0].src : '');

// Wyciaga identyfikator filmu z pelnego adresu albo przyjmuje gotowy identyfikator.
// Obsluguje: youtu.be/ID, youtube.com/watch?v=ID, youtube.com/shorts/ID,
// youtube.com/embed/ID, vimeo.com/ID.
export function youtubeId(value) {
  if (!value) return '';
  const tekst = String(value).trim();
  if (/^[\w-]{6,}$/.test(tekst) && !tekst.includes('/')) return tekst;
  const wzory = [
    /youtu\.be\/([\w-]{6,})/,
    /[?&]v=([\w-]{6,})/,
    /youtube\.com\/shorts\/([\w-]{6,})/,
    /youtube(?:-nocookie)?\.com\/embed\/([\w-]{6,})/,
  ];
  for (const wzor of wzory) {
    const dopasowanie = tekst.match(wzor);
    if (dopasowanie) return dopasowanie[1];
  }
  return '';
}

export function vimeoId(value) {
  if (!value) return '';
  const tekst = String(value).trim();
  if (/^\d{6,}$/.test(tekst)) return tekst;
  const dopasowanie = tekst.match(/vimeo\.com\/(?:video\/)?(\d{6,})/);
  return dopasowanie ? dopasowanie[1] : '';
}

// Adres do osadzenia w danych strukturalnych i w mapie witryny (bez autoodtwarzania).
export function embedUrl(item) {
  const yt = youtubeId(item.youtube);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt}`;
  const vm = vimeoId(item.vimeo);
  if (vm) return `https://player.vimeo.com/video/${vm}`;
  return '';
}

// Adres do osadzenia w odtwarzaczu na stronie (z autoodtwarzaniem po kliknieciu).
export function embedUrlPlayer(item) {
  const yt = youtubeId(item.youtube);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0`;
  const vm = vimeoId(item.vimeo);
  if (vm) return `https://player.vimeo.com/video/${vm}?autoplay=1`;
  return '';
}

// Dane filmu w formie gotowej do wypisania na stronie.
export const mediaFacts = (item) => {
  const fakty = [];
  if (item.city) fakty.push({ label: 'Miejscowość', value: item.city });
  if (item.system) fakty.push({ label: 'System', value: item.system });
  if (item.color) fakty.push({ label: 'Kolor', value: item.color });
  if (item.dimensions) fakty.push({ label: 'Wymiary', value: item.dimensions });
  if (item.duration) fakty.push({ label: 'Długość', value: czytajCzas(item.duration) });
  return fakty.map((f) => ({ label: f.label, value: tk(f.value) }));
};

// ISO 8601 (PT1M12S) na zapis czytelny dla czlowieka (1:12).
export function czytajCzas(iso) {
  if (!iso || typeof iso !== 'string') return '';
  const dopasowanie = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!dopasowanie) return iso;
  const [, h, m, s] = dopasowanie;
  const godziny = Number(h || 0);
  const minuty = Number(m || 0);
  const sekundy = Number(s || 0);
  const czesc = (n) => String(n).padStart(2, '0');
  return godziny > 0 ? `${godziny}:${czesc(minuty)}:${czesc(sekundy)}` : `${minuty}:${czesc(sekundy)}`;
}

// Czy sa jakiekolwiek materialy wideo (decyduje o indeksowaniu strony /wideo).
export const hasMedia = videos.length + reels.length > 0;
