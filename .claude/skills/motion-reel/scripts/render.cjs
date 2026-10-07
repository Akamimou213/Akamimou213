// Render a draw(t) engine (index.html + timeline.json in <project>) with headless Chromium.
//   node render.cjs <project> sheet  <WxH> <out.png>  [--lang fr]          one frame per beat (+0.3 s), tiled
//   node render.cjs <project> stills <WxH> <dir> <t...> [--lang fr]        PNG stills at times t (seconds)
//   node render.cjs <project> video  <WxH> <from> <to> <out.mp4> [--lang fr] [--sub 6]   frames [from,to), H.264 yuv420p
//   node render.cjs <project> det    <WxH> <t> [--lang fr]                 determinism: t, other frames, t again -> identical?
// --sub 1 gives a fast draft (no motion blur). Env: CHROMIUM_PATH=/opt/pw-browsers/chromium, PLAYWRIGHT_PATH=<.../node_modules/playwright>
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(process.env.PLAYWRIGHT_PATH)); }
const { spawn, execFileSync } = require('child_process'), fs = require('fs'), path = require('path'), crypto = require('crypto');

const argv = process.argv.slice(2), opt = {}, pos = [];
for (let i = 0; i < argv.length; i++) argv[i].startsWith('--') ? (opt[argv[i].slice(2)] = argv[++i]) : pos.push(argv[i]);
const [project, mode, size, ...rest] = pos;
if (!project || !mode || !size) { console.error(fs.readFileSync(__filename, 'utf8').split('\n').slice(0, 6).join('\n')); process.exit(2); }
const [w, h] = size.split('x').map(Number);
const dir = path.resolve(project);
const tlText = fs.readFileSync(path.join(dir, 'timeline.json'), 'utf8'), TL = JSON.parse(tlText);
const FPS = TL.fps || 60, lang = opt.lang || (TL.langs || ['en'])[0], sub = opt.sub ? Number(opt.sub) : undefined;

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  page.on('pageerror', e => { console.error('PAGE ERROR', e); process.exit(1); });
  page.on('console', m => m.type() === 'error' && console.error('console:', m.text()));
  // file:// blocks font CORS, so fonts travel as base64; the motion library is injected, not fetched
  const fonts = (TL.fonts || []).map(f => ({ ...f, b64: fs.readFileSync(path.resolve(dir, f.file)).toString('base64') }));
  const motion = fs.readFileSync(path.join(__dirname, '../lib/motion.js'), 'utf8');
  await page.addInitScript({ content: `${motion};window.TL=${tlText};window.FONTS=${JSON.stringify(fonts)};` });
  await page.goto(`file://${path.join(dir, 'index.html')}?size=${size}&lang=${lang}`);
  await page.waitForFunction('window.ready === true', null, { timeout: 120000 });
  const frame = async i => { await page.evaluate(([i, sub]) => window.renderFrame(i, sub ? { sub } : {}), [i, sub]); return page.screenshot({ type: 'png' }); };

  if (mode === 'stills') {
    const [out, ...ts] = rest; fs.mkdirSync(out, { recursive: true });
    for (const t of ts.map(Number)) fs.writeFileSync(path.join(out, `${lang}-${size}-${t.toFixed(2).padStart(6, '0')}.png`), await frame(Math.round(t * FPS)));
  } else if (mode === 'sheet') {
    const out = rest[0], tmp = out + '.d'; fs.mkdirSync(tmp, { recursive: true });
    const beat = 60 / (TL.bpm || 120), n = Math.round(TL.duration / beat);
    // sample 0.3 s into each beat: late samples catch content mid-exit and the sheet looks empty
    for (let b = 0; b < n; b++) fs.writeFileSync(path.join(tmp, `${String(b).padStart(3, '0')}.png`), await frame(Math.round((b * beat + Math.min(.3, beat * .6)) * FPS)));
    const cols = w >= h ? 8 : 10, tw = w >= h ? 360 : 216, th = Math.round(tw * h / w);
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-pattern_type', 'glob', '-i', path.join(tmp, '*.png'),
      '-vf', `scale=${tw}:${th},tile=${cols}x${Math.ceil(n / cols)}:padding=6:color=gray`, '-frames:v', '1', out]);
    fs.rmSync(tmp, { recursive: true, force: true });
  } else if (mode === 'det') {
    const i = Math.round(Number(rest[0]) * FPS), a = await frame(i);
    for (const j of [0, Math.round(TL.duration * FPS) - 1, i + 37]) await frame(j);
    const b = await frame(i), md5 = x => crypto.createHash('md5').update(x).digest('hex');
    console.log(md5(a) === md5(b) ? `deterministic at frame ${i}` : `NOT deterministic at frame ${i}: state leaks between frames`);
    if (md5(a) !== md5(b)) process.exitCode = 1;
  } else if (mode === 'video') {
    const [from, to, out] = [Number(rest[0]), Number(rest[1]), rest[2]];
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-g', String(FPS * 2), out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let i = from; i < to; i++) {
      const b = await frame(i); if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r));
      if ((i - from) % (FPS * 2) === 0) console.error(`${path.basename(out)} ${i - from}/${to - from} ${((Date.now() - t0) / Math.max(1, i - from)).toFixed(0)} ms/frame`);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  } else { console.error('unknown mode', mode); process.exitCode = 2; }
  await browser.close();
})();
