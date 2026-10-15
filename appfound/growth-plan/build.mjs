#!/usr/bin/env node
// Builds a Growth Plan from one JSON file: an A4 HTML page, plus a PDF when Playwright is installed.
//   node growth-plan/build.mjs growth-plan/reports/my-app.json
// Output goes next to the JSON in out/: <slug>.html and <slug>.pdf
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node growth-plan/build.mjs <report.json>');
  process.exit(1);
}
const r = JSON.parse(await readFile(file, 'utf8'));

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const sum = (a, k) => a.reduce((n, x) => n + Number(x[k] || 0), 0);
const pct = (got, max) => (max ? Math.round((got / max) * 100) : 0);
const tone = (p) => (p >= 75 ? 'good' : p >= 50 ? 'mid' : 'bad');
const yesNo = (v) => (v === true ? '<span class="yes">Named</span>' : v === false ? '<span class="no">Not named</span>' : '<span class="na">n/a</span>');

/* Growth Score: every area is scored on its checks, so the number can be traced line by line */
const areas = r.areas.map((a) => {
  const got = sum(a.checks, 'score');
  const max = sum(a.checks, 'max');
  return { ...a, got, max, p: pct(got, max) };
});
const score = pct(sum(areas, 'got'), sum(areas, 'max'));

const page = (n, title, body) => `
<section class="page">
  <header class="ph"><span class="logo">appfound</span><span>Growth Plan · ${esc(r.app.name)}</span><span>${n}</span></header>
  <h2>${title}</h2>
  ${body}
  <footer class="pf">${r.sample ? '<b>Sample plan: illustrative data, not a real app.</b> · ' : ''}Public data only, checked ${esc(r.prepared.date)}. We did not access your accounts.</footer>
</section>`;

const checksTable = (a) => `
<table>
  <thead><tr><th>Check</th><th class="n">Score</th><th>What we saw</th></tr></thead>
  <tbody>${a.checks.map((c) => `<tr><td>${esc(c.label)}</td><td class="n"><b class="${tone(pct(c.score, c.max))}">${c.score}/${c.max}</b></td><td>${esc(c.note)}</td></tr>`).join('')}</tbody>
</table>
${a.findings?.length ? `<ul class="findings">${a.findings.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}`;

const area = (key) => areas.find((a) => a.key === key);
const areaBlock = (key) => {
  const a = area(key);
  return a ? `<p class="area-score">Area score <b class="${tone(a.p)}">${a.got}/${a.max}</b></p>${checksTable(a)}` : '';
};

const cover = `
<section class="page cover">
  <div class="cover__top"><span class="logo logo--light">appfound</span><span>Growth Plan</span></div>
  <div class="cover__app">
    ${r.app.icon ? `<img src="${esc(r.app.icon)}" alt="" />` : '<div class="ph-icon">★</div>'}
    <div><h1>${esc(r.app.name)}</h1><p>${esc(r.app.developer)} · ${esc(r.app.category)} · ${r.app.store === 'android' ? 'Google Play' : 'App Store'}</p></div>
  </div>
  <div class="cover__score"><span class="big">${score}</span><span class="of">/100</span><p>Growth Score</p></div>
  <p class="cover__verdict">${esc(r.verdict)}</p>
  <div class="cover__leak"><span>Biggest leak</span><b>${esc(r.biggest_leak.stage)}</b><p>${esc(r.biggest_leak.why)}</p></div>
  <div class="cover__by">Prepared by ${esc(r.prepared.by)}, Appfound · ${esc(r.prepared.date)}${r.video_url ? ` · Video teardown: <a href="${esc(r.video_url)}">${esc(r.video_url)}</a>` : ''}</div>
  ${r.sample ? '<div class="sample">SAMPLE · illustrative data</div>' : ''}
</section>`;

const summary = page('01', 'Summary', `
<div class="bars">${areas.map((a) => `
  <div class="bar"><span>${esc(a.name)}</span><div class="track"><i class="${tone(a.p)}" style="width:${a.p}%"></i></div><b>${a.got}/${a.max}</b></div>`).join('')}
</div>
<h3>Top 3 fixes, ranked by impact on cost per paying user</h3>
<ol class="fixes">${r.fixes.slice(0, 3).map((f) => `
  <li><div><b>${esc(f.title)}</b><p>${esc(f.why)}</p></div><span class="tag">Impact: ${esc(f.impact)}</span><span class="tag tag--ghost">Effort: ${esc(f.effort)}</span></li>`).join('')}
</ol>
<p class="how">How the score works: each area has 4–5 checks scored against what top apps in your category do. The total is points earned out of points possible. Every point is explained on the next pages.</p>`);

const store = page('02', 'Store page', areaBlock('store'));

const ads = page('03', 'Your ads vs your competitors', `
${areaBlock('ads')}
<h3>Meta Ad Library, active ads on ${esc(r.prepared.date)}</h3>
<table>
  <thead><tr><th>App</th><th class="n">Active ads</th><th>Formats</th><th>Longest running</th><th>Their main hook</th></tr></thead>
  <tbody>${r.competitor_ads.map((c) => `<tr${c.you ? ' class="you"' : ''}><td>${esc(c.app)}</td><td class="n">${esc(c.active_ads)}</td><td>${esc(c.formats)}</td><td>${esc(c.longest_running)}</td><td>${esc(c.top_hook)}</td></tr>`).join('')}</tbody>
</table>
<p class="how">Ads that keep running for weeks are usually profitable: advertisers switch off losers fast.</p>`);

const reviews = page('04', 'What your users say, and 5 ads to test', `
${areaBlock('reviews')}
<div class="two">
  <div><h3>Top complaints</h3>${r.reviews.pains.map((q) => `<blockquote><b>${esc(q.theme)}</b>“${esc(q.quote)}”</blockquote>`).join('')}</div>
  <div><h3>What they love</h3>${r.reviews.loves.map((q) => `<blockquote class="love"><b>${esc(q.theme)}</b>“${esc(q.quote)}”</blockquote>`).join('')}</div>
</div>
<h3>5 ad angles</h3>
<table>
  <thead><tr><th>Angle</th><th>Opening hook</th><th>Format</th></tr></thead>
  <tbody>${r.angles.slice(0, 5).map((a) => `<tr><td><b>${esc(a.angle)}</b></td><td>“${esc(a.hook)}”</td><td>${esc(a.format)}</td></tr>`).join('')}</tbody>
</table>`);

const funnel = page('05', 'Onboarding &amp; paywall walk-through', `
${areaBlock('funnel')}
<ol class="steps">${r.funnel.map((s) => `<li class="${s.leak ? 'leak' : ''}"><b>${esc(s.step)}</b><p>${esc(s.note)}</p>${s.leak ? '<span class="tag tag--coral">Leak</span>' : ''}</li>`).join('')}</ol>`);

const visibility = page('06', 'Search &amp; AI visibility', `
${areaBlock('visibility')}
<h3>App Store keywords</h3>
<table>
  <thead><tr><th>Keyword</th><th class="n">Your rank</th><th>Who ranks first</th></tr></thead>
  <tbody>${r.keywords.map((k) => `<tr><td>${esc(k.keyword)}</td><td class="n">${esc(k.rank)}</td><td>${esc(k.leader)}</td></tr>`).join('')}</tbody>
</table>
<h3>Does AI recommend you?</h3>
<table>
  <thead><tr><th>Question a user asks</th><th>ChatGPT</th><th>Perplexity</th><th>Gemini</th><th>Named instead</th></tr></thead>
  <tbody>${r.ai_visibility.map((q) => `<tr><td>“${esc(q.prompt)}”</td><td>${yesNo(q.chatgpt)}</td><td>${yesNo(q.perplexity)}</td><td>${yesNo(q.gemini)}</td><td>${esc(q.named_instead)}</td></tr>`).join('')}</tbody>
</table>
<p class="how">AI answers change from one run to the next. We asked each question once, logged out, on the date above.</p>`);

const plan = page('07', 'Your first 30 days', `
<ol class="weeks">${r.first_30_days.map((w) => `<li><span>${esc(w.week)}</span><p>${esc(w.do)}</p></li>`).join('')}</ol>
<div class="cta">
  <div>
    <p class="mono">Want us to run it?</p>
    <h3>Growth Partner · $1,500/month</h3>
    <p>Paid ads, 30–40 AI-made ads a month, tracking, store page, onboarding and paywall tests, ASO, SEO and AI visibility. A 90-day sprint, then month-to-month. Needs at least $2K a month in ad spend.</p>
    <p><b>Guarantee:</b> we agree on 1–2 targets in week 1. If we haven't beaten your baseline by day 90, your fourth month is free.</p>
  </div>
  <div class="cta__go"><p>Book a 30-min call</p><a href="${esc(r.contact.calendly)}">${esc(r.contact.calendly.replace(/^https?:\/\//, ''))}</a><p>or reply to the email this came with.</p></div>
</div>`);

const css = await readFile(new URL('./report.css', import.meta.url), 'utf8');
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<title>Growth Plan · ${esc(r.app.name)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet" />
<style>${css}</style></head>
<body>${cover}${summary}${store}${ads}${reviews}${funnel}${visibility}${plan}</body></html>`;

const slug = basename(file).replace(/\.json$/i, '');
const outDir = join(dirname(resolve(file)), 'out');
await mkdir(outDir, { recursive: true });
const htmlPath = join(outDir, `${slug}.html`);
await writeFile(htmlPath, html);
console.log(`Growth Score ${score}/100 · ${htmlPath}`);

/* PDF: optional, uses Playwright if it's installed (npm i -D playwright), otherwise open the HTML and print to PDF */
try {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch();
  const tab = await browser.newPage();
  await tab.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle' });
  const pdfPath = join(outDir, `${slug}.pdf`);
  await tab.pdf({ path: pdfPath, format: 'A4', printBackground: true, margin: { top: '0', right: '0', bottom: '0', left: '0' } });
  await browser.close();
  console.log(`PDF ${pdfPath}`);
} catch (e) {
  console.log(`No PDF (${e.code === 'ERR_MODULE_NOT_FOUND' ? 'Playwright not installed' : e.message}). Open the HTML in Chrome and print to PDF, A4, background graphics on.`);
}
