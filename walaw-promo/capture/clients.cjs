const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, locale: 'fr-CA' });
  for (const u of ['https://www.walaw.io/company/clients', 'https://www.walaw.io/resources/customer-stories/abc-clinique-sante', 'https://www.walaw.io/resources/customer-stories/nxtg-physio-call-centre', 'https://www.walaw.io/resources/customer-stories/asp-downtown-modernized-reception', 'https://www.walaw.io/company/about']) {
    await p.goto(u, { waitUntil: 'networkidle', timeout: 60000 });
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, 80)); } });
    const txt = await p.evaluate(() => document.body.innerText.replace(/\n{2,}/g, '\n'));
    console.log('=====', u, '\n', txt.slice(0, 3500));
  }
  await b.close();
})();
