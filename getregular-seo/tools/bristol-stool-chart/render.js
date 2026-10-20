/*
 * Server-side HTML for the chart, inserted at build time by `<!-- @render ... -->`,
 * so the 7 types are in the page HTML (indexable, and they work without JavaScript).
 * In Next.js, call the same functions from the server component.
 */
import { TYPES, SOURCES, SPEED, SIDE } from "./chart.js";
import { esc, sourceLinks, stoolSvg, appStoreUrl } from "../_shared/ui.js";

const URGENT = `<div class="alert urgent" style="margin:0"><span class="ico">!</span><div><h3>Talk to a doctor right away if…</h3><p>it lasts more than 2 days, or comes with a high fever, 6 or more loose stools a day, severe pain, black or bloody stool, or signs of dehydration. <span class="cite" style="display:block;margin-top:6px">Source: <a href="https://www.niddk.nih.gov/health-information/digestive-diseases/diarrhea/symptoms-causes">NIDDK</a></span></p></div></div>`;

export function chartRows() {
  return [1, 2, 3, 4, 5, 6, 7].map((t) => {
    const d = TYPES[t];
    const left = ((t - 1) / 6) * 78;
    return `<details class="row ${t === 3 || t === 4 ? "ideal" : ""}" id="type-${t}">
  <summary>${stoolSvg(t)}<span class="tn">Type ${t}</span>
    <span class="tl"><b>${esc(d.look)}</b><span>${esc(d.headline)}</span></span>
    <span class="sp"><span>${SPEED[t]} · ${SIDE[t]}</span><span class="bar"><i style="left:${left}%"></i></span></span></summary>
  <div class="more">
    ${d.urgentNote ? `<div class="span-all">${URGENT}</div>` : ""}
    <div class="panel"><h4>What it suggests</h4><p>${esc(d.suggests)}</p></div>
    <div class="panel"><h4>Common reasons</h4><ul class="ticks">${d.reasons.map((r) => `<li>${esc(r)}</li>`).join("")}</ul></div>
    <div class="panel"><h4>What to try</h4><ul class="ticks">${d.tryThis.map((r) => `<li>${esc(r)}</li>`).join("")}</ul><p class="cite">Based on ${sourceLinks(d.cite, SOURCES)}</p></div>
    <p class="row-cta span-all">One day is a clue; a week shows your pattern. <a class="js-appstore" data-ct="tool-stool-chart-type${t}" data-cpp="default" href="${appStoreUrl({ cpp: "default", ct: `tool-stool-chart-type${t}` })}">Log your type daily in Get Regular →</a></p>
  </div>
</details>`;
  }).join("\n");
}

/* The one-page print handout (hidden on screen). */
export function printSheet() {
  const rows = [1, 2, 3, 4, 5, 6, 7].map((t) => `<tr class="${t === 3 || t === 4 ? "ideal" : ""}"><td class="d">${stoolSvg(t, "#6b4f35")}</td><td class="n">Type ${t}</td>
    <td class="l"><b>${esc(TYPES[t].look)}</b><span>${esc(TYPES[t].headline)}</span></td><td class="s">${SPEED[t]} · ${SIDE[t]}</td></tr>`).join("");
  return `<div class="print-sheet" aria-hidden="true"><header><div><h1>Stool type chart</h1><p>7 types, slow to fast. Types 3–4 are often considered ideal.</p></div><p>Get Regular · gut-health app</p></header>
  <table>${rows}</table>
  <div class="doc"><b>Talk to a doctor</b> about blood in your stool or black, tarry stool; diarrhea lasting more than 2 days, with high fever, 6 or more loose stools a day or signs of dehydration; constipation with constant belly pain, vomiting, fever or weight loss without trying; or a change in bowel habits that lasts, especially if you're 50 or older (source: NIDDK).</div>
  <footer><span>Based on Lewis &amp; Heaton 1997 and Blake et al. 2016. Get Regular's own wording and drawings; general information, not a diagnosis.<br>getregular.com/tools/bristol-stool-chart · Log your type daily in the Get Regular app (scan the code).</span><span class="qr" data-qr="${esc(appStoreUrl({ cpp: "default", ct: "tool-stool-chart-print" }))}"></span></footer></div>`;
}
