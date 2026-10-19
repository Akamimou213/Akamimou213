const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
(async () => {
  const out = process.argv[2];
  const urls = process.argv.slice(3);
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'], proxy });
  const results = {};
  for (const [name, vp, ua] of [['mobile', { width: 390, height: 844 }, 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'], ['desktop', { width: 1440, height: 900 }, undefined]]) {
    const ctx = await browser.newContext({ viewport: vp, userAgent: ua, ignoreHTTPSErrors: false });
    for (const url of urls) {
      const page = await ctx.newPage();
      const reqs = [];
      page.on('response', r => { reqs.push({ url: r.url(), status: r.status(), type: r.request().resourceType(), size: Number(r.headers()['content-length'] || 0) }); });
      const consoleErr = []; page.on('console', m => { if (m.type() === 'error') consoleErr.push(m.text()); });
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(e => consoleErr.push('goto:' + e.message));
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } });
      await page.waitForTimeout(1500);
      const data = await page.evaluate(() => {
        const q = s => [...document.querySelectorAll(s)];
        const vis = el => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
        return {
          title: document.title,
          lang: document.documentElement.lang,
          meta: q('meta[name],meta[property]').map(m => [m.getAttribute('name') || m.getAttribute('property'), m.content]),
          canonical: q('link[rel=canonical]').map(l => l.href),
          headings: q('h1,h2,h3').map(h => [h.tagName, h.innerText.replace(/\s+/g, ' ').trim(), vis(h)]),
          words: (document.body.innerText.match(/[A-Za-z0-9'’]+/g) || []).length,
          links: q('a').map(a => ({ href: a.getAttribute('href'), text: a.innerText.replace(/\s+/g, ' ').trim().slice(0, 60), aria: a.getAttribute('aria-label'), visible: vis(a) })),
          buttons: q('button,[role=button]').map(b => ({ text: (b.innerText || b.getAttribute('aria-label') || '').trim().slice(0, 50), aria: b.getAttribute('aria-label') })),
          imgs: q('img').map(i => ({ src: i.currentSrc || i.src, alt: i.alt, natural: [i.naturalWidth, i.naturalHeight], rendered: [Math.round(i.getBoundingClientRect().width), Math.round(i.getBoundingClientRect().height)], loading: i.loading, attrW: i.getAttribute('width'), attrH: i.getAttribute('height') })),
          videos: q('video').map(v => ({ src: v.currentSrc, poster: v.poster, autoplay: v.autoplay, preload: v.preload, muted: v.muted })),
          jsonld: q('script[type="application/ld+json"]').map(s => s.textContent),
          scrollH: document.body.scrollHeight,
        };
      });
      data.requests = reqs; data.consoleErrors = consoleErr;
      if (name === 'mobile') await page.screenshot({ path: out + '/shot-' + url.replace(/[^a-z0-9]+/gi, '_').slice(-40) + '-mobile.png' });
      results[name + ' ' + url] = data;
      await page.close();
    }
    await ctx.close();
  }
  fs.writeFileSync(out + '/rendered.json', JSON.stringify(results, null, 1));
  await browser.close();
})();
