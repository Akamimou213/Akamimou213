import { defineConfig, type Plugin } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Inline the stylesheet into index.html so first paint doesn't wait on a second round trip.
// It's ~10 kB gzipped and the site is one page, so there's no separate CSS cache worth keeping.
function inlineCss(): Plugin {
  return {
    name: 'inline-css',
    apply: 'build',
    enforce: 'post',
    generateBundle(_, bundle) {
      const html = bundle['index.html'];
      if (!html || html.type !== 'asset') return;
      for (const [name, file] of Object.entries(bundle)) {
        if (file.type !== 'asset' || !name.endsWith('.css')) continue;
        const link = new RegExp(`<link rel="stylesheet"[^>]*href="/${name.replace(/[.]/g, '\\.')}"[^>]*>`);
        html.source = String(html.source).replace(link, () => `<style>${file.source}</style>`);
        delete bundle[name];
      }
    },
  };
}

// `--mode single` inlines every asset into one HTML file for shareable previews.
export default defineConfig(({ mode }) => ({
  plugins: mode === 'single' ? [viteSingleFile()] : [inlineCss()],
  build: {
    assetsInlineLimit: mode === 'single' ? 100_000_000 : 4096,
  },
}));
