// French copy of the scroll-driven feature cards, results, player and clients page (walaw.io FR toggle).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('https://www.walaw.io/', { waitUntil: 'networkidle' });
  const no = p.locator('button', { hasText: /No thanks/ }); if (await no.count()) await no.first().click();
  await p.locator('header button, nav button').filter({ hasText: /^\s*FR\s*$/ }).first().click(); await p.waitForTimeout(1500);
  const fy = await p.evaluate(() => document.querySelector('#features').getBoundingClientRect().y + scrollY);
  for (const d of [100, 720, 1320, 1920, 2520]) {
    await p.evaluate(y => scrollTo(0, y), fy - 100 + d); await p.waitForTimeout(2600);
    const txt = await p.evaluate(() => { const hs = [...document.querySelectorAll('#features h3')].filter(h => { const r = h.getBoundingClientRect(), s = getComputedStyle(h); return r.width && r.top > 0 && r.bottom < innerHeight && +s.opacity > .5; }); let e = hs[0]; while (e && e.parentElement && e.getBoundingClientRect().height < 300) e = e.parentElement; return e ? e.innerText : ''; });
    console.log('--- card @', d, '\n' + txt);
  }
  for (const sel of ['#demo']) { const t = await p.evaluate(s => document.querySelector(s)?.innerText, sel); console.log('---', sel, '\n' + t); }
  const res = await p.evaluate(() => { const h = [...document.querySelectorAll('h2')].find(h => /ROI|cliniques/.test(h.innerText)); let e = h; while (e && e.parentElement && e.getBoundingClientRect().height < 330) e = e.parentElement; return e?.innerText; });
  console.log('--- results\n' + res);
  await p.goto('https://www.walaw.io/company/clients', { waitUntil: 'networkidle' }); await p.waitForTimeout(800);
  const fr = p.locator('header button, nav button').filter({ hasText: /^\s*FR\s*$/ }); if (await fr.count()) { await fr.first().click(); await p.waitForTimeout(1500); }
  console.log('--- clients\n' + (await p.evaluate(() => document.body.innerText)).slice(0, 900));
  await b.close();
})();
