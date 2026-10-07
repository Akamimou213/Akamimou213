// Re-record the live agent player after clicking Play, recomputing its box after the click (fake clock, 30fps).
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const out = path.join(process.argv[2], 'seq');
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  for (const lang of ['en', 'fr']) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 3 });
    const page = await ctx.newPage();
    await page.clock.install();
    await page.goto('https://www.walaw.io/', { waitUntil: 'networkidle', timeout: 60000 });
    await page.clock.runFor(1500);
    const no = page.locator('button', { hasText: /No thanks|Non merci/ });
    if (await no.count()) { await no.first().click(); await page.clock.runFor(400); }
    if (lang === 'fr') { await page.locator('header button, nav button').filter({ hasText: /^\s*FR\s*$/ }).first().click(); await page.clock.runFor(1500); }
    const player = async () => (await page.evaluateHandle(() => { let e = document.querySelector('#demo h3'); while (e.parentElement && e.getBoundingClientRect().height < 250) e = e.parentElement; return e; })).asElement();
    await (await player()).scrollIntoViewIfNeeded(); await page.evaluate(() => scrollBy(0, -200)); await page.clock.runFor(1000);
    const box = async () => (await player()).evaluate(e => { const r = e.getBoundingClientRect(); return { x: r.x - 1, y: r.y - 1, width: r.width + 2, height: r.height + 2 }; });
    const b0 = await box();
    await page.screenshot({ path: path.join(out, `${lang}-player-ready.png`), clip: b0 });
    const btn = await (await player()).$('button');
    const bb = await btn.evaluate(e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
    fs.writeFileSync(path.join(out, `${lang}-player-geom.json`), JSON.stringify({ player: b0, button: bb }));
    await btn.click({ noWaitAfter: true });
    await page.clock.runFor(34);
    const b1 = await box();
    const dir = path.join(out, `${lang}-player-speaking`); fs.mkdirSync(dir, { recursive: true });
    const hs = new Set();
    for (let i = 0; i < 90; i++) {
      const buf = await page.screenshot({ path: path.join(dir, `${String(i).padStart(3, '0')}.png`), clip: b1 });
      hs.add(crypto.createHash('md5').update(buf).digest('hex'));
      await page.clock.runFor(1000 / 30);
    }
    console.log(lang, 'player box before/after click', JSON.stringify(b0), JSON.stringify(b1), 'distinct', hs.size);
    await ctx.close();
  }
  await browser.close();
})();
