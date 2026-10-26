const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const out = process.argv[2]; const urls = process.argv.slice(3);
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
  const browser = await chromium.launch({ proxy });
  const res = {};
  const iphone = { viewport: { width: 390, height: 844 }, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1', isMobile: true, hasTouch: true, deviceScaleFactor: 2 };
  for (const js of [true, false]) {
    const ctx = await browser.newContext({ ...iphone, javaScriptEnabled: js });
    for (const url of urls) {
      const page = await ctx.newPage(); const errs = []; const hosts = {}; const failed = [];
      page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
      page.on('pageerror', e => errs.push('pageerror: ' + e.message.slice(0, 200)));
      page.on('requestfailed', r => failed.push(r.url().slice(0, 120) + ' ' + (r.failure() || {}).errorText));
      page.on('response', r => { const h = new URL(r.url()).host; hosts[h] = (hosts[h] || 0) + 1; if (r.status() >= 400) failed.push(r.status() + ' ' + r.url().slice(0, 120)); });
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(e => errs.push('goto ' + e.message));
      const tag = url.replace(/https:\/\/www\.getregular\.com/, '').replace(/[^a-z0-9]+/gi, '_') || '_home';
      await page.screenshot({ path: `${out}/shots/${tag}-${js ? 'js' : 'nojs'}.png` });
      if (js) { await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 150)); } }); await page.waitForTimeout(1200); }
      const d = await page.evaluate(() => {
        const vis = el => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.05; };
        const h1 = document.querySelector('h1');
        return { h1: h1 && h1.innerText, h1vis: h1 && vis(h1), iframes: [...document.querySelectorAll('iframe')].map(f => f.src.slice(0, 90)), consent: !!document.querySelector('[class*=cookie i],[id*=cookie i],[class*=consent i],[id*=consent i]'), hiddenText: [...document.querySelectorAll('main p, main h2, main h3, main li')].filter(e => e.innerText.trim() && !vis(e)).length, ptotal: document.querySelectorAll('main p, main h2, main h3, main li').length, overflowX: document.documentElement.scrollWidth > window.innerWidth + 1, videos: [...document.querySelectorAll('video')].map(v => ({ src: v.currentSrc.slice(-50), poster: !!v.poster, autoplay: v.autoplay, preload: v.preload })), smallTap: [...document.querySelectorAll('a,button')].filter(a => { const r = a.getBoundingClientRect(); return vis(a) && r.height > 0 && r.height < 24 && r.width < 24; }).length };
      });
      res[(js ? 'js ' : 'nojs ') + url] = { ...d, errs, failed: failed.slice(0, 10), hosts };
      await page.close();
    }
    await ctx.close();
  }
  fs.writeFileSync(out + '/rendered.json', JSON.stringify(res, null, 1));
  await browser.close();
})();
