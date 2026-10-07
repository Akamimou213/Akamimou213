// Frame-accurate capture of the site's own animations: Playwright's fake clock drives timers/rAF,
// so we step 1/30 s between clip screenshots. Usage: node crawl4.js <assets>
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const out = path.join(process.argv[2], 'seq');
fs.mkdirSync(out, { recursive: true });
const log = [];
const STEP = 1000 / 30;

async function seq(page, getEl, name, seconds) {
  const dir = path.join(out, name); fs.mkdirSync(dir, { recursive: true });
  const el = await getEl();
  const box = await el.evaluate(e => { const r = e.getBoundingClientRect(); return { x: r.x - 1, y: r.y - 1, width: r.width + 2, height: r.height + 2 }; });
  const hashes = new Set();
  const n = Math.round(seconds * 30);
  for (let i = 0; i < n; i++) {
    const b = await page.screenshot({ path: path.join(dir, `${String(i).padStart(3, '0')}.png`), clip: box });
    hashes.add(crypto.createHash('md5').update(b).digest('hex'));
    await page.clock.runFor(STEP);
  }
  log.push(`${name}: ${n} frames @30fps, ${hashes.size} distinct, box ${Math.round(box.width)}x${Math.round(box.height)}`);
  fs.writeFileSync(path.join(dir, 'box.json'), JSON.stringify(box));
}
const cardOf = (page, idx) => async () => (await page.evaluateHandle(i => {
  const hs = [...document.querySelectorAll('#features h3')].filter(h => { const r = h.getBoundingClientRect(), s = getComputedStyle(h); return r.width && r.top > 0 && r.bottom < innerHeight && +s.opacity > .5; });
  let e = hs[0]; while (e && e.parentElement && e.getBoundingClientRect().height < 300) e = e.parentElement; return e;
}, idx)).asElement();

async function run(browser, lang) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 3 });
  const page = await ctx.newPage();
  await page.clock.install();
  await page.goto('https://www.walaw.io/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.clock.runFor(1500);
  const no = page.locator('button', { hasText: /No thanks|Non merci/ });
  if (await no.count()) { await no.first().click(); await page.clock.runFor(400); }
  if (lang === 'fr') { await page.locator('header button, nav button').filter({ hasText: /^\s*FR\s*$/ }).first().click(); await page.clock.runFor(1500); }
  const L = n => `${lang}-${n}`;
  // hero waveform
  await page.evaluate(() => scrollTo(0, 0)); await page.clock.runFor(300);
  await seq(page, async () => (await page.evaluateHandle(() => [...document.querySelectorAll('div')].filter(d => d.children.length > 30 && d.getBoundingClientRect().width > 300 && d.getBoundingClientRect().top < 900).sort((a, b) => b.children.length - a.children.length)[0])).asElement(), L('hero-wave'), 2);
  // features: scroll each into place, then record from the moment it becomes active
  const fy = await page.evaluate(() => { const r = document.querySelector('#features').getBoundingClientRect(); return r.y + scrollY; });
  for (const [i, d, secs] of [[1, 720, 3], [2, 1320, 4.5], [4, 2520, 3]]) {
    await page.evaluate(y => scrollTo(0, y), fy - 100 + d);
    for (let k = 0; k < 40; k++) {                      // wait (in fake time) until the card is actually shown
      await page.clock.runFor(34);
      const el = await cardOf(page, i)();
      const w = el ? await el.evaluate(e => e.getBoundingClientRect().width) : 0;
      if (w > 300) { log.push(`${L('feat' + i)} visible after ${(k + 1) * 34}ms`); break; }
    }
    await seq(page, cardOf(page, i), L(`feat${i}`), secs);
  }
  // live agent player: Ready, then click play and record
  const dy = await page.evaluate(() => document.querySelector('#demo').getBoundingClientRect().y + scrollY);
  await page.evaluate(y => scrollTo(0, y), dy + 60); await page.clock.runFor(800);
  const playerEl = async () => (await page.evaluateHandle(() => { let e = document.querySelector('#demo h3'); while (e.parentElement && e.getBoundingClientRect().height < 250) e = e.parentElement; return e; })).asElement();
  const pe = await playerEl();
  const pbox = await pe.evaluate(e => { const r = e.getBoundingClientRect(); return { x: r.x - 1, y: r.y - 1, width: r.width + 2, height: r.height + 2 }; });
  await page.screenshot({ path: path.join(out, L('player-ready.png')), clip: pbox });
  const btn = await pe.$('button');
  const bb = await btn.evaluate(e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  fs.writeFileSync(path.join(out, L('player-geom.json')), JSON.stringify({ player: pbox, button: bb }));
  await btn.click();
  const dir = path.join(out, L('player-speaking')); fs.mkdirSync(dir, { recursive: true });
  for (let i = 0; i < 90; i++) { await page.screenshot({ path: path.join(dir, `${String(i).padStart(3, '0')}.png`), clip: pbox }); await page.clock.runFor(STEP); await page.waitForTimeout(20); }
  log.push(`${L('player-speaking')}: 90 frames (audio-driven parts advance in real time)`);
  // results + CTA
  const res = page.locator('h2').filter({ hasText: /What clinics see|cliniques/i }).first();
  await res.scrollIntoViewIfNeeded(); await page.clock.runFor(2500);
  const rc = await res.evaluateHandle(h => { let e = h; while (e.parentElement && e.getBoundingClientRect().height < 330) e = e.parentElement; return e; });
  const rb = await rc.evaluate(e => { const r = e.getBoundingClientRect(); return { x: r.x - 1, y: r.y - 1, width: r.width + 2, height: r.height + 2 }; });
  await page.screenshot({ path: path.join(out, L('results.png')), clip: rb });
  await ctx.close();
}

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  for (const lang of (process.argv[3] || 'en,fr').split(',')) await run(browser, lang).catch(e => log.push(`${lang} ERROR ${e.stack.slice(0, 400)}`));
  await browser.close();
  fs.writeFileSync(path.join(process.argv[2], 'crawl4-log.txt'), log.join('\n'));
  console.log(log.join('\n'));
})();
