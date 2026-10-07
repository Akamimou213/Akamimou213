// Crawl walaw.io: screenshots (desktop + mobile), text, images, colors, fonts, links -> <out>/
// Usage: node crawl.js <url> <outdir>
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const [url, out] = process.argv.slice(2);
fs.mkdirSync(path.join(out, 'screens'), { recursive: true });

async function autoScroll(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); }
    window.scrollTo(0, 0); await new Promise(r => setTimeout(r, 400));
  });
}

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const fontResponses = [];
  for (const [name, vp, dpr] of [['desktop', { width: 1440, height: 900 }, 2], ['mobile', { width: 390, height: 844 }, 3]]) {
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: dpr, locale: 'fr-CA' });
    const page = await ctx.newPage();
    page.on('response', r => { const u = r.url(); if (/\.(woff2?|ttf|otf)(\?|$)/.test(u) || r.request().resourceType() === 'font') fontResponses.push(u); });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1500);
    await autoScroll(page);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(out, 'screens', `${name}-full.png`), fullPage: true });
    await page.screenshot({ path: path.join(out, 'screens', `${name}-hero.png`) });
    if (name === 'desktop') {
      const info = await page.evaluate(() => {
        const cs = el => { const s = getComputedStyle(el); return { color: s.color, bg: s.backgroundColor, bgImage: s.backgroundImage.slice(0, 200), font: s.fontFamily, size: s.fontSize, weight: s.fontWeight }; };
        const rect = el => { const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) }; };
        const sections = [...document.querySelectorAll('section, header, footer, nav, main > div')].map(s => ({ tag: s.tagName, id: s.id, cls: (s.className || '').toString().slice(0, 120), rect: rect(s), text: s.innerText.replace(/\s+\n/g, '\n').slice(0, 1500) }));
        const heads = [...document.querySelectorAll('h1,h2,h3,h4')].map(h => ({ tag: h.tagName, text: h.innerText.trim(), rect: rect(h), style: cs(h) }));
        const buttons = [...document.querySelectorAll('a,button')].filter(b => b.innerText.trim()).map(b => ({ text: b.innerText.trim().slice(0, 80), href: b.getAttribute('href'), rect: rect(b), style: cs(b) }));
        const imgs = [...document.querySelectorAll('img')].map(i => ({ src: i.currentSrc || i.src, alt: i.alt, nat: [i.naturalWidth, i.naturalHeight], rect: rect(i) }));
        const svgs = [...document.querySelectorAll('svg')].filter(s => s.getBoundingClientRect().width > 60).map(s => ({ rect: rect(s), html: s.outerHTML.slice(0, 400) }));
        const vars = {};
        for (const sh of document.styleSheets) { try { for (const r of sh.cssRules) if (r.selectorText && /:root|\.dark/.test(r.selectorText)) for (const p of r.style) if (p.startsWith('--')) vars[`${r.selectorText} ${p}`] = r.style.getPropertyValue(p).trim(); } catch (e) { } }
        const faces = [];
        for (const sh of document.styleSheets) { try { for (const r of sh.cssRules) if (r.constructor.name === 'CSSFontFaceRule') faces.push(r.cssText.slice(0, 300)); } catch (e) { faces.push('cross-origin sheet: ' + sh.href); } }
        const colorCount = {};
        for (const el of document.querySelectorAll('body *')) {
          const s = getComputedStyle(el);
          for (const c of [s.color, s.backgroundColor, s.borderTopColor]) if (c && c !== 'rgba(0, 0, 0, 0)') colorCount[c] = (colorCount[c] || 0) + 1;
        }
        return {
          title: document.title, lang: document.documentElement.lang, metaDesc: document.querySelector('meta[name=description]')?.content,
          body: cs(document.body), heads, buttons, imgs, svgs, vars, faces,
          fontsLoaded: [...document.fonts].map(f => `${f.family} ${f.weight} ${f.style} ${f.status}`),
          colors: Object.entries(colorCount).sort((a, b) => b[1] - a[1]).slice(0, 25), sections,
          pageHeight: document.body.scrollHeight, fullText: document.body.innerText,
        };
      });
      info.fontResponses = [...new Set(fontResponses)];
      fs.writeFileSync(path.join(out, 'site.json'), JSON.stringify(info, null, 2));
      // per-section viewport-sized screenshots for cropping
      for (const [i, s] of info.sections.entries()) {
        if (s.rect.h < 120 || s.rect.w < 600) continue;
        await page.screenshot({ path: path.join(out, 'screens', `section-${String(i).padStart(2, '0')}-${s.tag.toLowerCase()}.png`), fullPage: true,
          clip: { x: 0, y: s.rect.y, width: 1440, height: Math.min(s.rect.h, 2400) } });
      }
    }
    await ctx.close();
  }
  await browser.close();
  console.log('done');
})();
