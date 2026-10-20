// Build a single-file prototype.html for each tool (opens from file://, easy to share).
// Inlines ../_shared/base.css and every ES module imported by the page script
// (one level: page -> ./x.js and ../_shared/x.js), stripping `export`/`import`.
// Usage: node tools/build.mjs            (all tools)
//        node tools/build.mjs poop-color-chart
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const only = process.argv[2];
const tools = readdirSync(root, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith("_") && existsSync(join(root, d.name, "index.html")))
  .map((d) => d.name)
  .filter((n) => !only || n === only);

const IMPORT_RE = /^\s*import\s+[^;]*?from\s+["']([^"']+)["'];?\s*$/gm;

function inlineModule(file, seen) {
  if (seen.has(file)) return "";
  seen.add(file);
  let src = readFileSync(file, "utf8");
  let deps = "";
  src = src.replace(IMPORT_RE, (_, spec) => { deps += inlineModule(resolve(dirname(file), spec), seen); return ""; });
  return deps + "\n" + src.replace(/^export\s+(?=(const|function|let|class|async))/gm, "") + "\n";
}

for (const name of tools) {
  const dir = join(root, name);
  let html = readFileSync(join(dir, "index.html"), "utf8");
  html = html.replace(/<link rel="stylesheet" href="([^"]+\.css)">/g, (_, href) =>
    `<style>\n${readFileSync(resolve(dir, href), "utf8")}\n</style>`);
  const m = html.match(/<script type="module">([\s\S]*?)<\/script>/);
  if (!m) throw new Error(`${name}: no module script`);
  const seen = new Set();
  let body = m[1];
  let mods = "";
  body = body.replace(IMPORT_RE, (_, spec) => { mods += inlineModule(resolve(dir, spec), seen); return ""; });
  html = html.replace(m[0], () => `<script>\n(() => {\n${mods}\n${body}\n})();\n</script>`);
  writeFileSync(join(dir, "prototype.html"), html);
  console.log(`built ${name}/prototype.html (${html.length} bytes)`);
}
