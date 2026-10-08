// Copy the two OFL fonts this film uses from their @fontsource packages into public/fonts/,
// with their licence files, so renders never depend on the network.
//   npm run fonts
import { copyFileSync, mkdirSync } from 'node:fs';

const out = new URL('../public/fonts/', import.meta.url);
mkdirSync(out, { recursive: true });
const files = [
  ['@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2', 'instrument-serif-latin-400-normal.woff2'],
  ['@fontsource/instrument-serif/LICENSE', 'LICENSE-instrument-serif.txt'],
  ['@fontsource-variable/archivo/files/archivo-latin-wght-normal.woff2', 'archivo-latin-wght-normal.woff2'],
  ['@fontsource-variable/archivo/LICENSE', 'LICENSE-archivo.txt'],
];
for (const [from, to] of files) {
  copyFileSync(new URL(`../node_modules/${from}`, import.meta.url), new URL(to, out));
  console.log(`${from} -> public/fonts/${to}`);
}
