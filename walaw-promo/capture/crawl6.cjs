// Record the hero waveform (the bars flanking the hero CTA) at 30fps with the fake clock, background hidden.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const out = path.join(process.argv[2], 'seq', 'hero-bars'); fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.clock.install();
  await page.goto('https://www.walaw.io/', { waitUntil: 'networkidle' });
  await page.clock.runFor(1500);
  const no = page.locator('button', { hasText: /No thanks/ }); if (await no.count()) { await no.first().click(); await page.clock.runFor(300); }
  const info = await page.evaluate(() => {
    const host = [...document.querySelectorAll('div')].find(d => (d.className + '').includes('md:h-[180px]'));
    const cv = host.querySelector('canvas'); cv.setAttribute('data-bars', '1');
    const r = cv.getBoundingClientRect();
    return { parent: [r.x, r.y, r.width, r.height], canvas: [cv.width, cv.height] };
  });
  console.log(JSON.stringify(info));
  if (info.parent) {
    // hide everything except the bars so we capture them on transparent background
    await page.addStyleTag({ content: `html,body{background:transparent!important} body *{visibility:hidden!important} [data-bars],[data-bars] *{visibility:visible!important}` });
    const [x, y, w, h] = info.parent;
    for (let i = 0; i < 90; i++) {
      await page.screenshot({ path: path.join(out, `${String(i).padStart(3, '0')}.png`), clip: { x, y, width: w, height: h }, omitBackground: true });
      await page.clock.runFor(1000 / 30);
    }
    fs.writeFileSync(path.join(out, 'box.json'), JSON.stringify(info));
  }
  await b.close();
})();
