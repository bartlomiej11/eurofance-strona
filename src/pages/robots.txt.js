import { site } from '../lib/content.js';

export const GET = () => {
  const bots = [
    'Googlebot',
    'Googlebot-Image',
    'Bingbot',
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'ClaudeBot',
    'anthropic-ai',
    'PerplexityBot',
    'Google-Extended',
    'Applebot',
    'YandexBot',
  ];

  const lines = [
    '# robots.txt Eurofance, generowany automatycznie przy budowaniu strony',
    'User-agent: *',
    'Allow: /',
    'Disallow: /koszyk',
    'Disallow: /dziekujemy',
    'Disallow: /szukaj',
    'Disallow: /*?q=',
    'Disallow: /*?s=',
    '',
  ];

  bots.forEach((bot) => {
    lines.push(`User-agent: ${bot}`);
    lines.push('Allow: /');
    lines.push('Disallow: /koszyk');
    lines.push('Disallow: /dziekujemy');
    lines.push('');
  });

  lines.push(`Sitemap: ${site.domain}/sitemap.xml`);
  lines.push('');

  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

export const prerender = true;