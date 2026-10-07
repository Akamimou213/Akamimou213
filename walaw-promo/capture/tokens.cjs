const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('https://www.walaw.io/', { waitUntil: 'networkidle' });
  const r = await p.evaluate(() => {
    const cs = e => getComputedStyle(e);
    const grad = [...document.querySelectorAll('*')].map(e => cs(e).backgroundImage).filter(v => v.includes('gradient')).slice(0, 8);
    const pct = [...document.querySelectorAll('*')].find(e => e.children.length === 0 && /^100%$/.test(e.textContent.trim()));
    const card = document.querySelector('#demo h3')?.closest('div[class*="border"]') || document.querySelector('#demo h3')?.parentElement?.parentElement;
    const btn = [...document.querySelectorAll('a')].find(a => a.textContent.trim() === 'Schedule a demo');
    return {
      gradients: [...new Set(grad)],
      pct: pct && { bg: cs(pct).backgroundImage, size: cs(pct).fontSize, weight: cs(pct).fontWeight, ls: cs(pct).letterSpacing, clip: cs(pct).webkitBackgroundClip },
      card: card && { radius: cs(card).borderRadius, border: cs(card).border, shadow: cs(card).boxShadow, bg: cs(card).backgroundColor },
      btn: btn && { radius: cs(btn).borderRadius, bg: cs(btn).backgroundColor, font: cs(btn).fontSize + ' ' + cs(btn).fontWeight, pad: cs(btn).padding },
      h1: (() => { const h = document.querySelector('h1'); return { ls: cs(h).letterSpacing, lh: cs(h).lineHeight }; })(),
    };
  });
  console.log(JSON.stringify(r, null, 1));
  await b.close();
})();
