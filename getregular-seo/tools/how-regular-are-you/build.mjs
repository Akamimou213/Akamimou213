// Inline quiz.js and copy.js into one self-contained prototype.html (opens from file://).
import { readFileSync, writeFileSync } from "node:fs";
const strip = (f) => readFileSync(new URL(f, import.meta.url), "utf8").replace(/^export /gm, "");
const html = readFileSync(new URL("index.html", import.meta.url), "utf8");
const out = html.replace(/<script type="module">\s*import[^\n]*\n\s*import[^\n]*\n/, () =>
  `<script>\n(() => {\n${strip("quiz.js")}\n${strip("copy.js")}\n`).replace(/<\/script>\s*<\/body>/, "})();\n</script>\n</body>");
if (out === html) throw new Error("inline failed");
writeFileSync(new URL("prototype.html", import.meta.url), out);
console.log("wrote prototype.html", out.length, "bytes");
