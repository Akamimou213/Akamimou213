import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `--mode single` inlines every asset into one HTML file for shareable previews.
export default defineConfig(({ mode }) => ({
  plugins: mode === 'single' ? [viteSingleFile()] : [],
  build: {
    assetsInlineLimit: mode === 'single' ? 100_000_000 : 4096,
  },
}));
