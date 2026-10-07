// High-res element captures for animation: feature cards (+ their own animation over time), card parts,
// the live agent player (Ready -> Speaking), results card, CTA, hero. EN and FR. Usage: node crawl3.js <assets>
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const out = path.join(process.argv[2], 'ui');
fs.mkdirSync(out, { recursive: true });
const log = [];
let PAGE = null;
const md5 = b => crypto.createHash('md5').update(b).digest('hex').slice(0, 8);

async function shotSeq(el, name, ms, every) {
  const hashes = [];
  for (let t = 0; t <= ms; t += every) {
    const b = await clipShot(el, path.join(out, `${name}-t${String(t).padStart(4, '0')}.png`));
    hashes.push(md5(b));
    await PAGE.waitForTimeout(every);
  }
  const uniq = [...new Set(hashes)].length;
  log.push(`${name}: ${hashes.length} frames, ${uniq} distinct`);
  return uniq;
}
async function clipShot(el, file) {
  const b = await el.evaluate(e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
  const page = PAGE;
  return page.screenshot({ path: file, clip: { x: Math.max(0, b.x - 1), y: Math.max(0, b.y - 1), width: b.width + 2, height: b.height + 2 } });
}
async function boxOf(el) { return el.evaluate(e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }); }

async function run(browser, lang) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 3 });
  const page = await ctx.newPage();
  PAGE = page;
  await page.goto('https://www.walaw.io/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1000);
  const no = page.locator('button', { hasText: /No thanks|Non merci/ });
  if (await no.count()) { await no.first().click(); await page.waitForTimeout(300); }
  if (lang === 'fr') {
    await page.locator('header button, nav button').filter({ hasText: /^\s*FR\s*$/ }).first().click().catch(async () => {
      await page.getByText('FR', { exact: true }).first().click();
    });
    await page.waitForTimeout(1500);
    log.push(`FR h1: ${await page.locator('h1').first().innerText()}`);
    fs.writeFileSync(path.join(process.argv[2], 'site-fr.txt'), await page.evaluate(() => document.body.innerText));
    await page.screenshot({ path: path.join(process.argv[2], 'screens', 'fr-hero.png') });
  }
  const P = n => `${lang}-${n}`;
  // hero headline + waveform
  await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(500);
  await clipShot(await page.locator('h1').first().elementHandle(), path.join(out, P('hero-h1.png')));
  const heroCta = page.locator('main a, section a').filter({ hasText: /Schedule a demo|Planifier|démo/i }).first();
  if (await heroCta.count()) { await clipShot(await heroCta.elementHandle(), path.join(out, P('cta-hero.png'))); log.push(`${lang} CTA text: ${await heroCta.innerText()}`); }
  // waveform strip in hero: the widest element containing many bars
  const strip = await page.evaluateHandle(() => {
    const cands = [...document.querySelectorAll('div')].filter(d => d.children.length > 30 && d.getBoundingClientRect().width > 300 && d.getBoundingClientRect().top < 900);
    return cands.sort((a, b) => b.children.length - a.children.length)[0] || null;
  });
  if (strip.asElement()) { log.push(`${lang} hero bar strip children=${await strip.evaluate(e => e.children.length)}`); await shotSeq(strip.asElement(), P('hero-wave'), 1200, 200); }

  // features: each card at its scroll position
  const feats = await page.evaluate(() => { const s = document.querySelector('#features'); const r = s.getBoundingClientRect(); return { y: r.y + scrollY, h: r.height }; });
  const stops = [100, 720, 1320, 1920, 2520].map(d => feats.y - 100 + d);
  for (const [i, y] of stops.entries()) {
    await page.evaluate(y => scrollTo(0, y), y); await page.waitForTimeout(150);
    const card = await page.evaluateHandle(() => {
      const hs = [...document.querySelectorAll('#features h3')].filter(h => { const r = h.getBoundingClientRect(), s = getComputedStyle(h); return r.width && r.top > 0 && r.bottom < innerHeight && +s.opacity > .5; });
      if (!hs.length) return null;
      let e = hs[0];
      while (e.parentElement && e.getBoundingClientRect().height < 300) e = e.parentElement;
      return e;
    });
    const el = card.asElement();
    if (!el) { log.push(`${lang} feature ${i}: no card`); continue; }
    const title = await el.evaluate(e => e.querySelector('h3')?.innerText.trim());
    const b = await boxOf(el);
    log.push(`${lang} feature ${i} "${title}" card ${Math.round(b.w)}x${Math.round(b.h)} at ${Math.round(b.x)},${Math.round(b.y)}`);
    await shotSeq(el, P(`feat${i}`), 2400, 300);
    // parts of the card for the assemble beat, with positions relative to the card
    const parts = await el.evaluate(card => {
      const cr = card.getBoundingClientRect();
      const pick = [...card.querySelectorAll('h3, p, button, [class*="wave"], svg, span, div')].filter(n => { const r = n.getBoundingClientRect(); return r.width > 20 && r.height > 8 && r.width < cr.width * .98; });
      // keep only top-most distinct boxes (no ancestor of another kept box)
      const keep = [];
      for (const n of pick) if (!keep.some(k => k.contains(n))) keep.push(n);
      return keep.slice(0, 12).map((n, k) => { n.setAttribute('data-part', k); const r = n.getBoundingClientRect(); return { k, tag: n.tagName, text: (n.innerText || '').slice(0, 60), x: r.x - cr.x, y: r.y - cr.y, w: r.width, h: r.height }; });
    });
    fs.writeFileSync(path.join(out, P(`feat${i}-parts.json`)), JSON.stringify({ title, card: b, parts }, null, 1));
    for (const p of parts) { const h = await page.locator(`[data-part="${p.k}"]`).first().elementHandle(); if (h) await clipShot(h, path.join(out, P(`feat${i}-part${p.k}.png`))).catch(() => { }); }
    // hover test on inner items
    const items = await el.$$('li, [class*="card"], [class*="rounded"]');
    for (const [j, it] of items.slice(0, 3).entries()) {
      const before = md5(await clipShot(el, '/dev/null').catch(() => Buffer.from('x')));
      await it.hover().catch(() => { }); await page.waitForTimeout(350);
      const after = await PAGE.screenshot({ clip: await el.evaluate(e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; }) });
      if (md5(after) !== before) { fs.writeFileSync(path.join(out, P(`feat${i}-hover${j}.png`)), after); log.push(`  hover item ${j} changes the card`); }
      await page.mouse.move(5, 5); await page.waitForTimeout(200);
    }
    // feature pagination dots (real control)
    if (i === 0) {
      const dots = await page.$$('#features button');
      log.push(`  #features buttons: ${dots.length}`);
    }
  }
  // live agent player: Ready -> click play -> Speaking
  const demo = await page.evaluate(() => { const s = document.querySelector('#demo'); const r = s.getBoundingClientRect(); return r.y + scrollY; });
  await page.evaluate(y => scrollTo(0, y), demo + 60); await page.waitForTimeout(600);
  const player = await page.evaluateHandle(() => { const h = [...document.querySelectorAll('#demo h3')][0]; let e = h; while (e.parentElement && e.getBoundingClientRect().height < 150) e = e.parentElement; return e; });
  const pel = player.asElement();
  if (pel) {
    const pb = await boxOf(pel);
    const btn = await pel.$('button');
    const bb = btn ? await boxOf(btn) : null;
    fs.writeFileSync(path.join(out, P('player-geom.json')), JSON.stringify({ player: pb, button: bb }));
    await clipShot(pel, path.join(out, P('player-ready.png')));
    if (btn) { await btn.click(); await shotSeq(pel, P('player-speaking'), 3000, 100); }
  }
  // results card
  const res = page.locator('h2').filter({ hasText: /What clinics see|Ce que les cliniques|après/i }).first();
  if (await res.count()) {
    await res.scrollIntoViewIfNeeded(); await page.waitForTimeout(1500);
    const rc = await res.evaluateHandle(h => { let e = h; while (e.parentElement && e.getBoundingClientRect().height < 330) e = e.parentElement; return e; });
    await shotSeq(rc.asElement(), P('results'), 900, 300);
  }
  await ctx.close();
}

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  for (const lang of ['en', 'fr']) await run(browser, lang).catch(e => log.push(`${lang} ERROR ${e.message}`));
  await browser.close();
  fs.writeFileSync(path.join(process.argv[2], 'crawl3-log.txt'), log.join('\n'));
  console.log(log.join('\n'));
})();
