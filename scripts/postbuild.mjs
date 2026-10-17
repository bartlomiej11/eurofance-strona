/**
 * Porzadkuje wynik budowania pod adresy wymagane w briefie:
 *  - blog i wszystko pod /blog/ dziala jako katalog z ukosnikiem na koncu (/blog/wpisy/),
 *  - pozostale strony sa plaskie, bez ukosnika (/ogrodzenia-panelowe, /sklep/panel-3d-153).
 *
 * Astro buduje wszystko w trybie katalogow, dlatego po budowaniu zamieniamy
 * dist/<sciezka>/index.html na dist/<sciezka>.html i usuwamy pusty katalog.
 * Reguly przepisywania adresow sa w public/.htaccess.
 */
import { readdir, rename, rm, stat, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

async function pruneEmptyDirs(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  let count = 0;
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      count += 1;
      continue;
    }
    const full = join(dir, entry.name);
    const inner = await pruneEmptyDirs(full);
    if (inner === 0) await rm(full, { recursive: true, force: true });
    else count += 1;
  }
  return count;
}

async function main() {
  if (!existsSync(DIST)) {
    console.error('Brak katalogu dist. Najpierw uruchom: npm run build');
    process.exit(1);
  }

  const files = await walk(DIST);
  const indexFiles = files.filter((file) => file.endsWith(`${sep}index.html`) || file.endsWith('/index.html'));
  let moved = 0;
  const movedList = [];

  for (const file of indexFiles) {
    const rel = relative(DIST, file).split(sep).join('/');
    if (rel === 'index.html') continue; // strona glowna zostaje jako index.html

    const segments = rel.split('/');
    const dirSegments = segments.slice(0, -1);
    const isBlog = dirSegments[0] === 'blog';
    if (isBlog) continue; // blog zostaje w katalogu, adres z ukosnikiem

    const targetRel = `${dirSegments.join('/')}.html`;
    const target = join(DIST, targetRel);
    await mkdir(dirname(target), { recursive: true });
    await rename(file, target);
    moved += 1;
    movedList.push(`/${targetRel}`);
  }

  await pruneEmptyDirs(DIST);

  const stillDir = (await walk(DIST)).filter((file) => file.endsWith('/index.html'));
  console.log(`Plikow HTML przepisanych na adres plaski: ${moved}`);
  console.log(`Stron zostawionych jako katalogi (blog): ${stillDir.length}`);

  // Raport dla dokumentacji wdrozenia
  const report = ['# Wygenerowane adresy URL', '', `Liczba stron plaskich: ${moved}`, '', ...movedList.map((url) => `- ${url.replace(/\.html$/, '')}`)];
  await mkdir(join(DIST, '..', 'raport'), { recursive: true }).catch(() => {});
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});