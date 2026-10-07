// Second pass: dismiss cookies, step through the scroll-driven features section, play the agent demo,
// capture FR versions and product pages. Usage: node crawl2.js <outdir>
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const out = process.argv[2];
const S = p => path.join(out, 'screens', p);
const log = [];

async function open(browser, url) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1200);
  const no = page.getByRole('button', { name: /No thanks|Non merci|Refuser/i });
  if (await no.count()) { await no.first().click(); await page.waitForTimeout(400); }
  return { ctx, page };
}

async function sectionBox(page, sel) {
  return page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return { y: r.y + scrollY, h: r.height }; }, sel);
}

async function stepFeatures(page, prefix) {
  const box = await sectionBox(page, '#features');
  if (!box) { log.push(`${prefix}: no #features`); return; }
  log.push(`${prefix}: #features y=${Math.round(box.y)} h=${Math.round(box.h)}`);
  let last = '';
  for (let y = box.y - 100, i = 0; y < box.y + box.h; y += 120, i++) {
    await page.evaluate(y => window.scrollTo(0, y), y);
    await page.waitForTimeout(650);
    const active = await page.evaluate(() => [...document.querySelectorAll('#features h3')].filter(h => { const r = h.getBoundingClientRect(); const s = getComputedStyle(h); return r.width > 0 && r.top > 0 && r.bottom < innerHeight && s.visibility !== 'hidden' && +s.opacity > .5; }).map(h => h.innerText.trim()).join(' | '));
    if (active !== last) {
      const f = `${prefix}-features-${String(i).padStart(2, '0')}.png`;
      await page.screenshot({ path: S(f) });
      log.push(`  ${f}  scrollY=${Math.round(y)}  active=[${active}]`);
      last = active;
    }
  }
}

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  fs.mkdirSync(S(''), { recursive: true });

  // EN home
  let { ctx, page } = await open(browser, 'https://www.walaw.io/');
  await page.screenshot({ path: S('en-hero-clean.png') });
  await stepFeatures(page, 'en');
  for (const [sel, name] of [['#demo', 'en-demo'], ['#security', 'en-security']]) {
    const b = await sectionBox(page, sel);
    log.push(`${sel}: ${JSON.stringify(b)}`);
    if (b) { await page.evaluate(y => window.scrollTo(0, y), b.y - 40); await page.waitForTimeout(700); await page.screenshot({ path: S(`${name}.png`) }); }
  }
  // Results card + comparison table, by heading text
  for (const [txt, name] of [['What clinics see after going live', 'en-results'], ['Why clinics leave their call centre', 'en-compare']]) {
    const h = page.getByText(txt).first();
    await h.scrollIntoViewIfNeeded(); await page.evaluate(() => window.scrollBy(0, -160)); await page.waitForTimeout(800);
    await page.screenshot({ path: S(`${name}.png`) });
  }
  // Play the agent demo and capture the UI over time
  const demo = await sectionBox(page, '#demo');
  if (demo) {
    await page.evaluate(y => window.scrollTo(0, y), demo.y - 40); await page.waitForTimeout(600);
    const btns = await page.$$('#demo button');
    log.push(`#demo buttons: ${btns.length}`);
    if (btns.length) {
      await btns[0].click().catch(e => log.push('click err ' + e.message));
      for (const ms of [600, 1500, 3000, 5000]) { await page.waitForTimeout(ms === 600 ? 600 : ms - [600, 1500, 3000, 5000][[600, 1500, 3000, 5000].indexOf(ms) - 1]); await page.screenshot({ path: S(`en-demo-playing-${ms}.png`) }); }
    }
  }
  // FR toggle
  const fr = page.getByRole('button', { name: /^FR$/ }).first();
  if (await fr.count()) {
    await page.evaluate(() => window.scrollTo(0, 0)); await fr.click(); await page.waitForTimeout(1500);
    log.push(`FR toggle -> url ${page.url()}, h1="${await page.locator('h1').first().innerText()}"`);
    await page.screenshot({ path: S('fr-hero.png') });
    await page.screenshot({ path: S('fr-full.png'), fullPage: true });
    await stepFeatures(page, 'fr');
    const frText = await page.evaluate(() => document.body.innerText);
    fs.writeFileSync(path.join(out, 'site-fr.txt'), frText);
    for (const [txt, name] of [['Ce que les cliniques', 'fr-results']]) {
      const h = page.getByText(new RegExp(txt)).first();
      if (await h.count()) { await h.scrollIntoViewIfNeeded(); await page.evaluate(() => window.scrollBy(0, -160)); await page.waitForTimeout(800); await page.screenshot({ path: S(`${name}.png`) }); }
    }
  }
  await ctx.close();

  // Product pages
  for (const slug of ['ai-receptionist', 'booking-booster', 'voicemailia', 'clavia']) {
    ({ ctx, page } = await open(browser, `https://www.walaw.io/products/${slug}`));
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } scrollTo(0, 0); });
    await page.waitForTimeout(800);
    await page.screenshot({ path: S(`product-${slug}.png`), fullPage: true });
    const imgs = await page.evaluate(() => [...document.querySelectorAll('img')].filter(i => i.naturalWidth > 400).map(i => `${i.currentSrc} ${i.naturalWidth}x${i.naturalHeight} alt="${i.alt}"`));
    log.push(`product ${slug}: h1="${await page.locator('h1').first().innerText().catch(() => '')}" big imgs=${JSON.stringify(imgs)}`);
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(out, 'crawl2-log.txt'), log.join('\n'));
  console.log(log.join('\n'));
})();
