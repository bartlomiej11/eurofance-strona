import { defineConfig } from 'astro/config';

// Statyczny HTML. Bez Reacta, Vue, Next.js i SPA.
// Adresy URL: dokladnie jak na obecnej stronie (patrz src/data/pages/*.json oraz public/.htaccess).
export default defineConfig({
  site: 'https://eurofance.pl',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
  devToolbar: { enabled: false },
  vite: {
    build: {
      assetsInlineLimit: 4096,
      cssMinify: 'lightningcss',
    },
  },
});