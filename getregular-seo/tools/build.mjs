// Build a single-file prototype.html for each tool (opens from file://, easy to share).
//  - <!-- @include name {"key":"value"} -->  -> _shared/partials/name.html with {{key}} filled
//  - <!-- @related current-slug -->          -> cards for the other tools (TOOLS below)
//  - <!-- @render ./module.js#fn -->         -> HTML returned by fn() at build time (server-rendered content)
//  - inlines ../_shared/base.css and every ES module the page script imports
//  - embeds ../_shared/img/*.jpg as data URIs so the file is self-contained
// Usage: node tools/build.mjs [tool-slug]
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const shared = join(root, "_shared");

export const TOOLS = [
  { slug: "bristol-stool-chart", title: "Bristol stool chart", blurb: "All 7 poop types explained, what's normal, and a printable chart.", img: "moss" },
  { slug: "why-am-i-bloated", title: "Why am I so bloated?", blurb: "A 1-minute quiz: your bloat profile and a 7-day plan to test it.", img: "kiwi-table" },
];

const only = process.argv[2];
const dirs = readdirSync(root, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith("_") && existsSync(join(root, d.name, "index.html")))
  .map((d) => d.name).filter((n) => !only || n === only);

const IMPORT_RE = /^\s*import\s+[^;]*?from\s+["']([^"']+)["'];?\s*$/gm;

function inlineModule(file, seen) {
  if (seen.has(file)) return "";
  seen.add(file);
  let src = readFileSync(file, "utf8");
  let deps = "";
  src = src.replace(IMPORT_RE, (_, spec) => { deps += inlineModule(resolve(dirname(file), spec), seen); return ""; });
  return deps + "\n" + src.replace(/^export\s+(?=(const|function|let|class|async))/gm, "") + "\n";
}

function related(current) {
  const other = TOOLS.filter((t) => t.slug !== current);
  const cards = other.map((t) =>
    `<a class="tool-card wide" href="/tools/${t.slug}" style="--bg:url(../_shared/img/${t.img}.jpg)"><span class="n">Next free check</span><h3>${t.title}</h3><p>${t.blurb}</p><span class="go">Open the tool →</span></a>`).join("\n");
  return `<section class="related sec night no-print" aria-labelledby="relH"><div class="wrap">
  <h2 class="h3" id="relH" style="margin:0 0 20px">Another free tool</h2>
  ${cards}</div></section>`;
}

function expand(html) {
  html = html.replace(/<!--\s*@include\s+([\w-]+)\s*(\{[\s\S]*?\})?\s*-->/g, (_, name, json) => {
    const vars = json ? JSON.parse(json) : {};
    return readFileSync(join(shared, "partials", `${name}.html`), "utf8").replace(/\{\{(\w+)\}\}/g, (m, k) => (k in vars ? vars[k] : m));
  });
  return html.replace(/<!--\s*@related\s+([\w-]+)\s*-->/g, (_, cur) => related(cur));
}

const imgCache = {};
function embedImages(html, dir) {
  return html.replace(/\.\.\/_shared\/img\/([\w-]+\.(?:jpg|jpeg|png|webp))/g, (m, file) => {
    const p = resolve(dir, "../_shared/img", file);
    if (!existsSync(p)) { console.warn(`  missing image ${file}`); return m; }
    const ext = file.split(".").pop().replace("jpg", "jpeg");
    imgCache[p] ||= `data:image/${ext};base64,${readFileSync(p).toString("base64")}`;
    return imgCache[p];
  });
}

async function renderBlocks(html, dir) {
  const re = /<!--\s*@render\s+([^#\s]+)#(\w+)\s*-->/g;
  for (const [tag, mod, fn] of [...html.matchAll(re)]) {
    const m = await import(pathToFileURL(resolve(dir, mod)).href);
    html = html.replace(tag, () => m[fn]());
  }
  return html;
}

for (const name of dirs) {
  const dir = join(root, name);
  let html = await renderBlocks(expand(readFileSync(join(dir, "index.html"), "utf8")), dir);
  html = html.replace(/<link rel="stylesheet" href="([^"]+\.css)">/g, (_, href) => `<style>\n${readFileSync(resolve(dir, href), "utf8")}\n</style>`);
  const m = html.match(/<script type="module">([\s\S]*?)<\/script>/);
  if (!m) throw new Error(`${name}: no module script`);
  const seen = new Set();
  let mods = "";
  const body = m[1].replace(IMPORT_RE, (_, spec) => { mods += inlineModule(resolve(dir, spec), seen); return ""; });
  html = html.replace(m[0], () => `<script>\n(() => {\n${mods}\n${body}\n})();\n</script>`);
  html = embedImages(html, dir);
  writeFileSync(join(dir, "prototype.html"), html);
  console.log(`built ${name}/prototype.html (${Math.round(html.length / 1024)} KB)`);
}
