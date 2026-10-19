const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'], proxy: { server: process.env.HTTPS_PROXY } });
  const ctx = await b.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage(); await p.goto('https://www.getregular.com/', { waitUntil: 'load' });
  await p.screenshot({ path: process.argv[2] + '/shot-home-nojs-mobile.png' });
  const r = await p.evaluate(() => { const h = document.querySelector('h1'); const cs = getComputedStyle(h); return { h1opacity: cs.opacity, visibleTextChars: document.body.innerText.length, hiddenByOpacity: [...document.querySelectorAll('[style*="opacity:0"],[style*="opacity: 0"]')].length }; });
  console.log(JSON.stringify(r)); await b.close();
})();
