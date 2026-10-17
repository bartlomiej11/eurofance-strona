import { allUrls, absolute } from '../lib/content.js';
import { allMedia, mediaUrl, primarySource, hasMedia, embedUrl } from '../lib/media.js';
import { tk } from '../lib/tk.js';

// Ucieczka znakow dla XML.
const x = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// ISO 8601 (PT1M12S) na sekundy dla znacznika video:duration.
function sekundy(iso) {
  const dopasowanie = String(iso || '').match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!dopasowanie) return 0;
  const [, h, m, s] = dopasowanie;
  return Number(h || 0) * 3600 + Number(m || 0) * 60 + Number(s || 0);
}

// Znaczniki rozszerzenia wideo dla jednego filmu.
function wpisWideo(item) {
  const plik = primarySource(item);
  const gracz = embedUrl(item);
  return [
    '    <video:video>',
    `      <video:thumbnail_loc>${x(absolute(item.poster))}</video:thumbnail_loc>`,
    `      <video:title>${x(tk(item.name))}</video:title>`,
    `      <video:description>${x(tk(item.description))}</video:description>`,
    plik ? `      <video:content_loc>${x(absolute(plik))}</video:content_loc>` : '',
    gracz ? `      <video:player_loc>${x(gracz)}</video:player_loc>` : '',
    item.duration ? `      <video:duration>${sekundy(item.duration)}</video:duration>` : '',
    item.uploadDate ? `      <video:publication_date>${x(item.uploadDate)}</video:publication_date>` : '',
    '      <video:family_friendly>yes</video:family_friendly>',
    '      <video:live>no</video:live>',
    '      <video:requires_subscription>no</video:requires_subscription>',
    `      <video:uploader info="${x(absolute('/kontakt'))}">Eurofance</video:uploader>`,
    '    </video:video>',
  ]
    .filter(Boolean)
    .join('\n');
}

export const GET = () => {
  const today = new Date().toISOString().slice(0, 10);
  const wpisy = [];

  // 1. Zwykle adresy wraz z obrazkami.
  for (const entry of allUrls()) {
    const obrazy = (entry.images || [])
      .filter(Boolean)
      .map((image) => `    <image:image><image:loc>${x(absolute(image))}</image:loc></image:image>`)
      .join('\n');
    wpisy.push(
      [
        '  <url>',
        `    <loc>${x(absolute(entry.loc))}</loc>`,
        `    <lastmod>${today}</lastmod>`,
        `    <changefreq>${entry.changefreq || 'monthly'}</changefreq>`,
        `    <priority>${entry.priority || '0.5'}</priority>`,
        obrazy,
        '  </url>',
      ]
        .filter(Boolean)
        .join('\n')
    );
  }

  // 2. Strona zbiorcza wideo, dodawana dopiero gdy sa jakiekolwiek materialy.
  if (hasMedia) {
    wpisy.push(
      [
        '  <url>',
        `    <loc>${x(absolute('/wideo'))}</loc>`,
        `    <lastmod>${today}</lastmod>`,
        '    <changefreq>weekly</changefreq>',
        '    <priority>0.6</priority>',
        '  </url>',
      ].join('\n')
    );
  }

  // 3. Strony filmow z rozszerzeniem wideo (Google: video:video).
  for (const item of allMedia) {
    wpisy.push(
      [
        '  <url>',
        `    <loc>${x(absolute(mediaUrl(item)))}</loc>`,
        `    <lastmod>${today}</lastmod>`,
        '    <changefreq>monthly</changefreq>',
        '    <priority>0.5</priority>',
        item.poster ? `    <image:image><image:loc>${x(absolute(item.poster))}</image:loc></image:image>` : '',
        item.poster ? wpisWideo(item) : '',
        '  </url>',
      ]
        .filter(Boolean)
        .join('\n')
    );
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${wpisy.join('\n')}
</urlset>`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};

export const prerender = true;