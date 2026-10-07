// node render.js stills <fmt> <lang> <outdir> <t1> <t2> ...   -> PNG stills at given times (seconds)
// node render.js range  <fmt> <lang> <from> <to> <out.mp4>    -> encoded segment (frames [from, to))
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(process.env.PLAYWRIGHT_PATH)); }  // npm i -D playwright, or point PLAYWRIGHT_PATH at an install
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

(async () => {
  const [mode, fmt, lang, ...rest] = process.argv.slice(2);
  const [w, h] = { V: [1080, 1920], S: [1080, 1080], L: [1920, 1080] }[fmt];
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  page.on('pageerror', e => { console.error('PAGE ERROR', e); process.exit(1); });
  const tl = fs.readFileSync(path.join(__dirname, 'timeline.json'), 'utf8');
  const inter = fs.readFileSync(path.join(__dirname, '../assets/fonts/Inter-normal-latin.woff2')).toString('base64');
  await page.addInitScript({ content: `window.TIMELINE=${tl};window.INTER_B64="${inter}";` });
  await page.goto(`file://${path.join(__dirname, 'index.html')}?fmt=${fmt}&lang=${lang}`);
  await page.waitForFunction('window.ready === true', null, { timeout: 60000 });
  if (mode === 'stills') {
    const [dir, ...times] = rest;
    fs.mkdirSync(dir, { recursive: true });
    for (const t of times.map(Number)) {
      await page.evaluate(i => window.renderFrame(i), Math.round(t * 30));
      await page.screenshot({ path: path.join(dir, `${fmt}-${lang}-${t.toFixed(2)}.png`) });
    }
  } else {
    const [from, to, out] = [Number(rest[0]), Number(rest[1]), rest[2]];
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'png', '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-g', '60', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let i = from; i < to; i++) {
      await page.evaluate(i => window.renderFrame(i), i);
      const buf = await page.screenshot({ type: 'png' });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
  }
  await browser.close();
})();
