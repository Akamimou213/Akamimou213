// node render.cjs sheet <WxH> <out.png>                 -> one frame per beat, as a contact sheet
// node render.cjs stills <WxH> <dir> <t...>              -> PNG stills
// node render.cjs video <WxH> <from> <to> <out.mp4>     -> frames [from,to) at 60 fps, 6-subframe motion blur, H.264 yuv420p
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(process.env.PLAYWRIGHT_PATH)); }
const { spawn, execFileSync } = require('child_process'), fs = require('fs'), path = require('path');
(async () => {
  const [mode, size, ...rest] = process.argv.slice(2);
  const [w, h] = size.split('x').map(Number);
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  page.on('pageerror', e => { console.error('PAGE ERROR', e); process.exit(1); });
  const tl = fs.readFileSync(path.join(__dirname, 'timeline.json'), 'utf8');
  const map = fs.readFileSync(path.join(__dirname, 'quebec-dots.json'), 'utf8');
  const inter = fs.readFileSync(path.join(__dirname, '../../assets/fonts/Inter-normal-latin.woff2')).toString('base64');
  await page.addInitScript({ content: `window.TL=${tl};window.MAPDATA=${map};window.INTER_N="${inter}";` });
  await page.goto(`file://${path.join(__dirname, 'index.html')}?size=${size}`);
  await page.waitForFunction('window.ready === true', null, { timeout: 60000 });
  const shot = async t => { await page.evaluate(([i]) => window.renderFrame(i), [Math.round(t * 60)]); return page.screenshot({ type: 'png' }); };
  if (mode === 'stills') {
    const [dir, ...ts] = rest; fs.mkdirSync(dir, { recursive: true });
    for (const t of ts.map(Number)) fs.writeFileSync(path.join(dir, `${size}-${t.toFixed(2).padStart(5, '0')}.png`), await shot(t));
  } else if (mode === 'sheet') {
    const out = rest[0], dir = out + '.d'; fs.mkdirSync(dir, { recursive: true });
    const beats = JSON.parse(tl).duration * JSON.parse(tl).bpm / 60;
    for (let b = 0; b < beats; b++) fs.writeFileSync(path.join(dir, `${String(b).padStart(3, '0')}.png`), await shot(b * .5 + .3));
    const cols = w >= h ? 8 : 10, tw = w >= h ? 360 : 216, th = Math.round(tw * h / w);
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-pattern_type', 'glob', '-i', path.join(dir, '*.png'), '-vf', `scale=${tw}:${th},tile=${cols}x${Math.ceil(beats / cols)}:padding=6:color=gray`, out]);
  } else {
    const [from, to, out] = [Number(rest[0]), Number(rest[1]), rest[2]];
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '60', '-c:v', 'png', '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-g', '120', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let i = from; i < to; i++) { await page.evaluate(([i]) => window.renderFrame(i), [i]); const b = await page.screenshot({ type: 'png' }); if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r)); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }
  await browser.close();
})();
