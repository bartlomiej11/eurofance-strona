/**
 * Kontrola jakosci wygenerowanej strony. Uruchamiana po budowaniu: npm run sprawdz
 *
 * Sprawdza:
 *  - czy kazdy link wewnetrzny prowadzi do wygenerowanej strony,
 *  - czy kazdy obrazek istnieje w dist,
 *  - czy w kodzie nie zostaly niepodmienione tokeny cen,
 *  - czy nie ma zakazanych dlugich myslnikow (— i –),
 *  - dlugosc title i meta description,
 *  - obecnosc jednego H1, canonical, JSON-LD, danych GTM.
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = new URL('../', import.meta.url).pathname;
const DIST = join(ROOT, 'dist');
const RAPORT = join(ROOT, 'raport');

// Adresy starego serwisu, ktore maja przekierowania w .htaccess i nie musza istniec jako strony.
const PRZEKIEROWANIA = new Set([
  '/ogrodzenia-panelowe-3d',
  '/ogrodzenia-panelowe-2d',
  '/ploty-panelowe',
  '/bramy-przesuwne',
  '/bramy-skrzydlowe',
  '/ogrodzenia',
  '/ogrodzenia-palisadowe-3d',
  '/index.php',
]);

const POMIJANE_PREFIKSY = ['/fonts/', '/images/', '/_astro/', '/api/', '/assets/'];
const POMIJANE_DOKLADNE = new Set(['/sitemap.xml', '/robots.txt', '/llms.txt', '/favicon.svg', '/404.html']);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const out = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

function urlFromFile(file) {
  const rel = relative(DIST, file).split(sep).join('/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return `/${rel.slice(0, -'index.html'.length)}`;
  if (rel.endsWith('.html')) return `/${rel.slice(0, -'.html'.length)}`;
  return null;
}

function normalizuj(url) {
  if (url === '/') return '/';
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

async function main() {
  if (!existsSync(DIST)) {
    console.error('Brak katalogu dist. Uruchom najpierw npm run build.');
    process.exit(1);
  }

  const files = await walk(DIST);
  const htmlFiles = files.filter((file) => file.endsWith('.html'));
  const strony = new Map();
  for (const file of htmlFiles) {
    const url = urlFromFile(file);
    if (url) strony.set(normalizuj(url), file);
  }

  const bledy = [];
  const ostrzezenia = [];
  const linki = new Set();
  const obrazki = new Set();

  for (const file of htmlFiles) {
    const url = urlFromFile(file) || relative(DIST, file);
    const html = await readFile(file, 'utf8');

    // linki wewnetrzne
    for (const match of html.matchAll(/href="(\/[^"#?]*)/g)) {
      const href = match[1];
      if (POMIJANE_PREFIKSY.some((prefix) => href.startsWith(prefix))) continue;
      if (POMIJANE_DOKLADNE.has(href)) continue;
      if (/\.(png|jpe?g|webp|svg|ico|gif|css|js|xml|txt|pdf|woff2?|mp4|webm|mov|vtt|mp3|zip)$/i.test(href)) continue;
      linki.add(href);
    }

    // obrazki
    for (const match of html.matchAll(/src="(\/images\/[^"]+)"/g)) {
      obrazki.add(match[1]);
    }

    // niepodmienione tokeny
    // {search_term_string} to standardowy element danych strukturalnych SearchAction, nie token ceny.
    const tokeny = [...html.matchAll(/\{[a-z_]{3,}\}/g)]
      .map((m) => m[0])
      .filter((token) => token !== '{search_term_string}');
    if (tokeny.length) bledy.push(`${url}: niepodmienione tokeny: ${[...new Set(tokeny)].join(', ')}`);

    // zakazane znaki
    if (html.includes('\u2014') || html.includes('\u2013')) {
      const gdzie = html.includes('\u2014') ? '—' : '–';
      bledy.push(`${url}: wystepuje zakazany znak ${gdzie}`);
    }

    // title
    const title = html.match(/<title>(.*?)<\/title>/s);
    if (!title) bledy.push(`${url}: brak tagu title`);
    else if (title[1].length > 80) ostrzezenia.push(`${url}: title ma ${title[1].length} znakow (zalecane do 65, w tytulach z cena dopuszczamy wiecej)`);

    // meta description
    const desc = html.match(/<meta name="description" content="([^"]*)"/);
    if (!desc) bledy.push(`${url}: brak meta description`);
    else if (desc[1].length < 100) bledy.push(`${url}: meta description ma tylko ${desc[1].length} znakow (cel 140 do 160)`);
    else if (desc[1].length < 135 || desc[1].length > 165) ostrzezenia.push(`${url}: meta description ma ${desc[1].length} znakow (cel 140 do 160)`);

    // H1
    const h1 = [...html.matchAll(/<h1[\s>]/g)].length;
    if (h1 !== 1) bledy.push(`${url}: liczba naglowkow H1 wynosi ${h1}, powinna byc 1`);

    // canonical
    if (!html.includes('rel="canonical"')) bledy.push(`${url}: brak rel="canonical"`);

    // JSON-LD
    const jsonld = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)];
    if (!jsonld.length) ostrzezenia.push(`${url}: brak danych strukturalnych JSON-LD`);
    for (const block of jsonld) {
      try {
        JSON.parse(block[1]);
      } catch (error) {
        bledy.push(`${url}: bledny JSON-LD (${error.message})`);
      }
    }

    // GTM
    if (!html.includes('googletagmanager.com/gtm.js')) ostrzezenia.push(`${url}: brak kontenera GTM`);
  }

  // weryfikacja linkow
  for (const href of linki) {
    const cel = normalizuj(href);
    if (strony.has(cel)) continue;
    if (PRZEKIEROWANIA.has(cel)) continue;
    bledy.push(`Link wewnetrzny bez strony docelowej: ${href}`);
  }

  // weryfikacja obrazkow
  for (const src of obrazki) {
    const sciezka = join(DIST, src.replace(/^\//, ''));
    if (!existsSync(sciezka)) bledy.push(`Brak pliku obrazka: ${src}`);
  }

  // duplikaty tytulow i opisow
  const tytuly = new Map();
  for (const [url, file] of strony) {
    const html = await readFile(file, 'utf8');
    const title = (html.match(/<title>(.*?)<\/title>/s) || [, ''])[1];
    if (tytuly.has(title)) bledy.push(`Zduplikowany title: ${title} (${tytuly.get(title)} i ${url})`);
    else tytuly.set(title, url);
  }

  await mkdir(RAPORT, { recursive: true });
  const raport = [
    '# Raport kontroli strony',
    '',
    `- Sprawdzonych stron: ${strony.size}`,
    `- Sprawdzonych linkow wewnetrznych: ${linki.size}`,
    `- Sprawdzonych obrazkow: ${obrazki.size}`,
    `- Bledy: ${bledy.length}`,
    `- Ostrzezenia: ${ostrzezenia.length}`,
    '',
    '## Bledy',
    '',
    ...(bledy.length ? bledy.map((line) => `- ${line}`) : ['- brak']),
    '',
    '## Ostrzezenia',
    '',
    ...(ostrzezenia.length ? ostrzezenia.map((line) => `- ${line}`) : ['- brak']),
    '',
  ].join('\n');

  await writeFile(join(RAPORT, 'kontrola.md'), raport, 'utf8');

  console.log(`Stron: ${strony.size}, linkow: ${linki.size}, obrazkow: ${obrazki.size}`);
  console.log(`Bledy: ${bledy.length}, ostrzezenia: ${ostrzezenia.length}`);
  for (const line of bledy.slice(0, 40)) console.log(`BLAD: ${line}`);
  for (const line of ostrzezenia.slice(0, 20)) console.log(`OSTRZEZENIE: ${line}`);
  console.log('Raport: raport/kontrola.md');

  if (bledy.length) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
