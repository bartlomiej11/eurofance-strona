import site from '../data/site.json';
import prices from '../data/prices.json';
import nav from '../data/nav.json';
import cities from '../data/cities.json';
import products from '../data/products.json';
import gallery from '../data/gallery.json';
import reviews from '../data/reviews.json';
import blogCategories from '../data/blog/categories.json';

const pageModules = import.meta.glob('../data/pages/*.json', { eager: true });
const postModules = import.meta.glob('../data/blog/posts/*.json', { eager: true });
const wikiModules = import.meta.glob('../data/blog/encyklopedia/*.json', { eager: true });

export { site, prices, nav, cities, products, gallery, reviews, blogCategories };

export const pages = Object.values(pageModules)
  .map((m) => m.default)
  .sort((a, b) => (a.slug || '').localeCompare(b.slug || '', 'pl'));

export const posts = Object.values(postModules)
  .map((m) => m.default)
  .sort((a, b) => (b.datePublished || '').localeCompare(a.datePublished || ''));

export const encyclopedia = Object.values(wikiModules)
  .map((m) => m.default)
  .sort((a, b) => a.title.localeCompare(b.title, 'pl'));

export const getPage = (slug) => pages.find((p) => p.slug === slug);
export const getPagesByKind = (kind) => pages.filter((p) => p.kind === kind);
export const getPost = (slug) => posts.find((p) => p.slug === slug);
export const getWiki = (slug) => encyclopedia.find((p) => p.slug === slug);
export const getProduct = (slug) => products.find((p) => p.slug === slug);
export const getProductsByCategory = (category) => products.filter((p) => p.category === category);
export const getCity = (slug) => cities.find((c) => c.slug === slug);
export const getPostsByCategory = (cat) => posts.filter((p) => (p.categories || []).includes(cat));

export const PER_PAGE = 10;
export const blogPagesCount = () => Math.max(1, Math.ceil(posts.length / PER_PAGE));
export const postsPage = (n) => posts.slice((n - 1) * PER_PAGE, n * PER_PAGE);

// Adresy produktow w sklepie: prefiks /sklep/ bez ukonika na koncu.
export const productUrl = (slug) => `/sklep/${slug}`;
export const postUrl = (slug) => `/blog/${slug}/`;
export const wikiUrl = (slug) => `/blog/encyklopedia/${slug}/`;
export const categoryUrl = (slug) => `/blog/kategoria/${slug}/`;

// Wszystkie adresy serwisu w jednym miejscu (sitemap, llms.txt, lista kontrolna).
export function allUrls() {
  const urls = [];
  const add = (loc, opts = {}) => urls.push({ loc, ...opts });

  add('/', { priority: '1.0', changefreq: 'weekly', label: 'Strona główna' });
  for (const p of pages) {
    if (p.kind === 'utility' && p.noindex) continue;
    if (p.slug === '') continue;
    add(`/${p.slug}`, {
      priority: p.kind === 'offer' ? '0.9' : '0.7',
      changefreq: 'monthly',
      label: p.h1,
      images: p.heroImage ? [p.heroImage] : [],
    });
  }
  for (const p of products) add(productUrl(p.slug), { priority: '0.6', changefreq: 'weekly', label: p.name, images: [p.image] });
  add('/blog/', { priority: '0.6', changefreq: 'weekly', label: 'Blog' });
  for (const c of blogCategories) add(categoryUrl(c.slug), { priority: '0.4', changefreq: 'monthly', label: c.name });
  for (const p of posts) add(postUrl(p.slug), { priority: '0.5', changefreq: 'monthly', label: p.title });
  add('/blog/encyklopedia/', { priority: '0.4', changefreq: 'monthly', label: 'Encyklopedia' });
  for (const w of encyclopedia) add(wikiUrl(w.slug), { priority: '0.4', changefreq: 'monthly', label: w.title });
  for (let n = 2; n <= blogPagesCount(); n += 1) add(`/blog/page/${n}/`, { priority: '0.2', changefreq: 'weekly', label: `Blog, strona ${n}` });

  return urls;
}

export const absolute = (path) => {
  if (!path) return site.domain;
  if (path.startsWith('http')) return path;
  return `${site.domain}${path.startsWith('/') ? path : `/${path}`}`;
};