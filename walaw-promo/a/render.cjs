// node render.cjs stills <lang> <dir> <t...>   |   node render.cjs range <lang> <from> <to> <out.mp4>   (60 fps, 1920x1080)
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(process.env.PLAYWRIGHT_PATH)); }
const { spawn } = require('child_process'), fs = require('fs'), path = require('path');
(async () => {
  const [mode, lang, ...rest] = process.argv.slice(2);
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', e => { console.error('PAGE ERROR', e); process.exit(1); });
  const tl = fs.readFileSync(path.join(__dirname, 'timeline.json'), 'utf8');
  const f = n => fs.readFileSync(path.join(__dirname, '../../assets/fonts', n)).toString('base64');
  await page.addInitScript({ content: `window.TL=${tl};window.INTER_N="${f('Inter-normal-latin.woff2')}";window.INTER_I="${f('Inter-italic-latin.woff2')}";` });
  await page.goto(`file://${path.join(__dirname, 'index.html')}?lang=${lang}`);
  await page.waitForFunction('window.ready === true', null, { timeout: 60000 });
  if (mode === 'stills') {
    const [dir, ...times] = rest; fs.mkdirSync(dir, { recursive: true });
    for (const t of times.map(Number)) { await page.evaluate(i => window.renderFrame(i), Math.round(t * 60)); await page.screenshot({ path: path.join(dir, `${lang}-${t.toFixed(2).padStart(5, '0')}.png`) }); }
  } else {
    const [from, to, out] = [Number(rest[0]), Number(rest[1]), rest[2]];
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '60', '-c:v', 'png', '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-g', '120', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let i = from; i < to; i++) { await page.evaluate(i => window.renderFrame(i), i); const b = await page.screenshot({ type: 'png' }); if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r)); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }
  await browser.close();
})();
