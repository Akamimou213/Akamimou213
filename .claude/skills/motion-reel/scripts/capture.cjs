// Capture a product's real assets with Playwright. Never redraw the UI from imagination: crop and animate these.
//   node capture.cjs site   <url> <assetsDir> [--lang FR]        screenshots, DOM text, CSS tokens, fonts, logos, ASSETS.md draft
//   node capture.cjs clip   <url> <selector> <out.png> [--scroll 1]   one element at 2x (clip shot: works on animated pages)
//   node capture.cjs record <url> <selector> <outDir> [--fps 30] [--secs 3] [--transparent 1]
//        the site's own animation, frame-accurate via the fake clock; --transparent hides everything else
// Env: CHROMIUM_PATH=/opt/pw-browsers/chromium. Respect the site's terms; capture only what you will show.
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(process.env.PLAYWRIGHT_PATH)); }
const fs = require('fs'), path = require('path');
const argv = process.argv.slice(2), opt = {}, pos = [];
for (let i = 0; i < argv.length; i++) argv[i].startsWith('--') ? (opt[argv[i].slice(2)] = argv[++i]) : pos.push(argv[i]);
const [mode, url, a, b] = pos;
const FONT_URLS = new Set();                                         // from network responses: performance entries overflow on big sites
const COOKIE = /^(accept( all)?|accepter( tout)?|tout accepter|i agree|agree|got it|ok|okay|no thanks|non merci|refuser|reject all|tout refuser)$/i;

async function open(browser, vp = { width: 1440, height: 900 }, scale = 2, clock = false) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: scale });
  const page = await ctx.newPage();
  page.on('response', r => { const u = r.url(); if (r.request().resourceType() === 'font' || /\.(woff2?|ttf|otf)(\?|$)/.test(u)) FONT_URLS.add(u); });
  if (clock) await page.clock.install();
  await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 }).catch(() => page.waitForLoadState('load'));
  clock ? await page.clock.runFor(1500) : await page.waitForTimeout(1200);
  for (const btn of await page.locator('button, a[role=button]').all()) {      // dismiss cookie / promo banners
    const t = ((await btn.textContent().catch(() => '')) || '').trim();
    if (COOKIE.test(t) && await btn.isVisible().catch(() => false)) { await btn.click().catch(() => {}); clock ? await page.clock.runFor(300) : await page.waitForTimeout(300); }
  }
  if (opt.lang) {                                                                // e.g. --lang FR: click the site's own language toggle
    const tog = page.locator('header button, nav button, header a, nav a').filter({ hasText: new RegExp(`^\\s*${opt.lang}\\s*$`) });
    if (await tog.count()) { await tog.first().click(); await page.waitForTimeout(1500); } else console.error(`no ${opt.lang} toggle found`);
  }
  return page;
}
const box = async (page, sel) => { const r = await page.locator(sel).first().boundingBox(); if (!r) throw new Error(`not visible: ${sel}`); return r; };

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  if (mode === 'site') {
    const out = path.resolve(a); for (const d of ['screens', 'brand', 'fonts', 'ui']) fs.mkdirSync(path.join(out, d), { recursive: true });
    const page = await open(browser);
    // 1. screenshots: full page + one per viewport scroll step (scroll-driven sections only exist mid-scroll)
    await page.screenshot({ path: path.join(out, 'screens', 'desktop-full.png'), fullPage: true });
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0, i = 0; y < H && i < 40; y += 800, i++) {
      await page.evaluate(y => window.scrollTo(0, y), y); await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(out, 'screens', `desktop-${String(i).padStart(2, '0')}.png`) });
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    // 2. DOM text (verbatim copy), CSS tokens, logos, font files
    const site = await page.evaluate(() => {
      const vis = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
      const txt = sel => [...document.querySelectorAll(sel)].filter(vis).map(e => e.innerText.trim().replace(/\s+/g, ' ')).filter(Boolean);
      const count = {}, bump = (k, v) => { if (v && !/rgba\(0, 0, 0, 0\)|transparent/.test(v)) (count[k] ??= {})[v] = (count[k][v] || 0) + 1; };
      for (const e of document.querySelectorAll('body *')) {
        if (!vis(e)) continue; const s = getComputedStyle(e);
        bump('color', s.color); bump('background', s.backgroundColor); bump('fontFamily', s.fontFamily); bump('radius', s.borderRadius !== '0px' && s.borderRadius);
        bump('shadow', s.boxShadow !== 'none' && s.boxShadow); if (s.backgroundImage.includes('gradient')) bump('gradient', s.backgroundImage);
      }
      const cx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
      const hex = c => { cx.clearRect(0, 0, 1, 1); cx.fillStyle = '#000'; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); const [r, g, b, a] = cx.getImageData(0, 0, 1, 1).data;
        return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase() + (a < 255 ? ` @${(a / 255).toFixed(2)}` : ''); };
      const merge = (o, f) => { const m = {}; for (const [k, v] of Object.entries(o || {})) { const kk = f(k); m[kk] = (m[kk] || 0) + v; } return m; };
      count.color = merge(count.color, hex); count.background = merge(count.background, hex);
      count.radius = merge(count.radius, r => (parseFloat(r) > 9000 ? 'pill (9999px)' : r));
      const top = o => Object.entries(o || {}).sort((x, y) => y[1] - x[1]).slice(0, 12);
      const vars = {}; for (const sh of document.styleSheets) { try { for (const r of sh.cssRules) if (r.selectorText === ':root') for (const p of r.style) if (p.startsWith('--')) vars[p] = r.style.getPropertyValue(p).trim(); } catch {} }
      const type = sel => { const e = document.querySelector(sel); if (!e) return null; const s = getComputedStyle(e); return { size: s.fontSize, weight: s.fontWeight, lh: s.lineHeight, ls: s.letterSpacing, family: s.fontFamily }; };
      const logos = [...document.querySelectorAll('header svg, nav svg, a[href="/"] svg, img[alt*=logo i], img[src*=logo i], img[class*=logo i]')].slice(0, 8)
        .map(e => e.tagName === 'svg' ? { svg: e.outerHTML } : { src: e.currentSrc || e.src, alt: e.alt });
      return {
        url: location.href, title: document.title, description: document.querySelector('meta[name=description]')?.content,
        h1: txt('h1'), h2: txt('h2'), h3: txt('h3'), buttons: txt('button, a[class*=btn], a[class*=button]').slice(0, 40),
        nav: txt('nav a').slice(0, 30), paragraphs: txt('main p, section p').slice(0, 80),
        tokens: { vars, color: top(count.color), background: top(count.background), fontFamily: top(count.fontFamily), radius: top(count.radius), shadow: top(count.shadow), gradient: top(count.gradient),
          h1: type('h1'), h2: type('h2'), body: type('p'), button: type('button, a[class*=btn]') },
        logos,
        images: [...document.images].filter(vis).map(i => ({ src: i.currentSrc || i.src, alt: i.alt, w: i.naturalWidth, h: i.naturalHeight })).slice(0, 60),
      };
    });
    site.capturedAt = new Date().toISOString(); site.fonts = [...FONT_URLS];
    site.logos.forEach((l, i) => l.svg && fs.writeFileSync(path.join(out, 'brand', `logo-${i}.svg`), l.svg.includes('xmlns') ? l.svg : l.svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')));
    for (const u of [...new Set([...site.fonts, ...site.logos.filter(l => l.src).map(l => l.src)])]) {
      try { const r = await page.request.get(u); if (r.ok()) fs.writeFileSync(path.join(out, u.match(/\.(woff2?|ttf|otf)(\?|$)/) ? 'fonts' : 'brand', decodeURIComponent(path.basename(new URL(u).pathname))), await r.body()); } catch (e) { console.error('skip', u, e.message); }
    }
    fs.writeFileSync(path.join(out, opt.lang ? `site-${opt.lang.toLowerCase()}.json` : 'site.json'), JSON.stringify(site, null, 1));
    // 3. mobile
    const m = await open(browser, { width: 390, height: 844 }, 3);
    await m.screenshot({ path: path.join(out, 'screens', 'mobile-hero.png') });
    // 4. ASSETS.md draft: what was found; fill in "used for" and "deliberately unused" before animating
    const ls = d => fs.readdirSync(path.join(out, d)).map(f => `- \`${d}/${f}\``).join('\n') || '- (none)';
    fs.writeFileSync(path.join(out, 'ASSETS.md'), `# Assets — ${site.url}\nCaptured ${site.capturedAt} with scripts/capture.cjs.\n\n` +
      `## Copy (verbatim)\nTitle: ${site.title}\n\nH1: ${site.h1.join(' | ')}\n\nH2: ${site.h2.slice(0, 12).join(' | ')}\n\nButtons: ${[...new Set(site.buttons)].slice(0, 15).join(' | ')}\n\n` +
      `## Tokens\nTop text colours: ${site.tokens.color.slice(0, 6).map(x => x[0]).join(', ')}\n\nTop backgrounds: ${site.tokens.background.slice(0, 6).map(x => x[0]).join(', ')}\n\n` +
      `Fonts: ${site.tokens.fontFamily.slice(0, 3).map(x => x[0]).join(' / ')}\n\nRadii: ${site.tokens.radius.slice(0, 5).map(x => x[0]).join(', ')}\n\nCSS vars: ${Object.keys(site.tokens.vars).length}\n\n` +
      `## Files\n${ls('screens')}\n${ls('brand')}\n${ls('fonts')}\n\n## Real interactions the cursor may perform\n- (list only what the live UI supports)\n\n## Deliberately unused\n- (and why: unverified claims, third-party logos without permission, ...)\n`);
    console.log(`captured ${site.url} -> ${out} (${site.h1.length} h1, ${site.fonts.length} fonts, ${site.logos.length} logos)`);
  } else if (mode === 'clip') {
    const page = await open(browser);
    if (opt.scroll) await page.locator(a).first().scrollIntoViewIfNeeded();
    const r = await box(page, a);                                   // clip shot, not element.screenshot(): no "stable" wait
    await page.screenshot({ path: b, clip: r });
    console.log(b, r);
  } else if (mode === 'record') {
    const FPS = Number(opt.fps || 30), SECS = Number(opt.secs || 3), out = path.resolve(b); fs.mkdirSync(out, { recursive: true });
    const page = await open(browser, undefined, 2, true);
    await page.locator(a).first().scrollIntoViewIfNeeded(); await page.clock.runFor(500);
    const r = await box(page, a);
    if (opt.transparent) {
      await page.locator(a).first().evaluate(e => e.setAttribute('data-rec', '1'));
      await page.addStyleTag({ content: 'html,body{background:transparent!important} body *{visibility:hidden!important} [data-rec],[data-rec] *{visibility:visible!important}' });
    }
    for (let i = 0; i < FPS * SECS; i++) {
      await page.screenshot({ path: path.join(out, `${String(i).padStart(4, '0')}.png`), clip: r, omitBackground: !!opt.transparent });
      await page.clock.runFor(1000 / FPS);
    }
    fs.writeFileSync(path.join(out, 'box.json'), JSON.stringify({ url, selector: a, fps: FPS, box: r }));
    console.log(`${FPS * SECS} frames -> ${out}`);
  } else console.error(fs.readFileSync(__filename, 'utf8').split('\n').slice(0, 6).join('\n'));
  await browser.close();
})();
