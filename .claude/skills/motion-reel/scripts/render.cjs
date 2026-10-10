// Render a draw(t) engine (index.html + timeline.json in <project>) with headless Chromium.
//   node render.cjs <project> sheet  <WxH> <out.png>  [--lang fr]          one frame per beat (+0.3 s), tiled
//   node render.cjs <project> stills <WxH> <dir> <t...> [--lang fr]        PNG stills at times t (seconds)
//   node render.cjs <project> video  <WxH> <from> <to> <out.mp4> [--lang fr] [--sub 6]   frames [from,to), H.264 yuv420p
//   node render.cjs <project> det    <WxH> <t> [--lang fr]                 determinism: t, other frames, t again -> identical?
//   node render.cjs <project> text   <WxH> [--at 1.2,3.4] [--lang fr]      every fillText/strokeText at settled times: clipped,
//                                    outside the safe box, overlapping, under the 22 px floor, low contrast (WCAG)
// --sub 1 gives a fast draft (no motion blur). --variant B deep-merges timeline.variants.B (hook/CTA/market tests).
// video refuses to run while copy has [bracketed placeholders], a stat has no number, or an image is missing
// (--allow-placeholders 1 for internal drafts only). --captions 0 renders the clean master without the caption rail. Env: CHROMIUM_PATH=/opt/pw-browsers/chromium, PLAYWRIGHT_PATH=<.../node_modules/playwright>
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(process.env.PLAYWRIGHT_PATH)); }
const { spawn, execFileSync } = require('child_process'), fs = require('fs'), path = require('path'), crypto = require('crypto');

const argv = process.argv.slice(2), opt = {}, pos = [];
for (let i = 0; i < argv.length; i++) argv[i].startsWith('--') ? (opt[argv[i].slice(2)] = argv[++i]) : pos.push(argv[i]);
const [project, mode, size, ...rest] = pos;
if (!project || !mode || !size) { console.error(fs.readFileSync(__filename, 'utf8').split('\n').slice(0, 6).join('\n')); process.exit(2); }
const [w, h] = size.split('x').map(Number);
const dir = path.resolve(project);
const merge = (a, b) => { if (b === null || typeof b !== 'object' || Array.isArray(b)) return b; const o = { ...a }; for (const k in b) o[k] = merge(a?.[k], b[k]); return o; };
let TL = JSON.parse(fs.readFileSync(path.join(dir, 'timeline.json'), 'utf8'));
if (opt.variant) { if (!TL.variants?.[opt.variant]) { console.error(`no variant ${opt.variant} in timeline.variants`); process.exit(2); } TL = merge(TL, TL.variants[opt.variant]); }
const tlText = JSON.stringify(TL), tag = opt.variant ? `${opt.variant}-` : '';
const FPS = TL.fps || 60, lang = opt.lang || (TL.langs || ['en'])[0], sub = opt.sub ? Number(opt.sub) : undefined;

// text probe (mode text): records each fillText/strokeText box in frame pixels, then measures contrast on the frame
const PROBE = `(() => {
  window.__TEXTS = [];
  for (const fn of ['fillText', 'strokeText']) {
    const o = CanvasRenderingContext2D.prototype[fn];
    CanvasRenderingContext2D.prototype[fn] = function (s, x, y, ...r) {
      if (window.__PROBE && String(s).trim()) {
        const m = this.measureText(s), T = this.getTransform();
        const xs = [x - m.actualBoundingBoxLeft, x + m.actualBoundingBoxRight], ys = [y - m.actualBoundingBoxAscent, y + m.actualBoundingBoxDescent];
        const P = [[xs[0], ys[0]], [xs[1], ys[0]], [xs[0], ys[1]], [xs[1], ys[1]]].map(([u, v]) => [T.a * u + T.c * v + T.e, T.b * u + T.d * v + T.f]);
        const px = +((this.font.match(/([\\d.]+)px/) || [0, 0])[1]) * Math.hypot(T.a, T.b);
        window.__TEXTS.push({ s: String(s), x0: Math.min(...P.map(p => p[0])), y0: Math.min(...P.map(p => p[1])), x1: Math.max(...P.map(p => p[0])), y1: Math.max(...P.map(p => p[1])),
          px, a: this.globalAlpha, ink: fn === 'fillText' && typeof this.fillStyle === 'string' ? this.fillStyle : null,
          outline: fn === 'strokeText' && typeof this.strokeStyle === 'string' && this.lineWidth >= 2 ? this.strokeStyle : null });
      }
      return o.call(this, s, x, y, ...r);
    };
  }
  const lum = (r, g, b) => [r, g, b].map(c => { c /= 255; return c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; }).reduce((s, c, i) => s + c * [.2126, .7152, .0722][i], 0);
  window.__measure = () => {
    const cv = document.querySelector('canvas'), g = cv.getContext('2d'), sw = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    const rgba = c => { sw.clearRect(0, 0, 1, 1); sw.fillStyle = c; sw.fillRect(0, 0, 1, 1); return sw.getImageData(0, 0, 1, 1).data; };
    const T = window.__TEXTS;
    return T.map(x => {
      if (!x.ink) return x;
      const [r, gg, b] = rgba(x.ink), Lt = lum(r, gg, b);
      // outlined text (captions) reads against its own outline, not the scene behind it
      const o = T.find(y => y.outline && y.s === x.s && Math.abs(y.x0 - x.x0) < 2 && Math.abs(y.y0 - x.y0) < 2);
      if (o) { const [R, G, B, A] = rgba(o.outline); if (A > 150) { const Lo = lum(R, G, B); return { ...x, cr: (Math.max(Lt, Lo) + .05) / (Math.min(Lt, Lo) + .05) }; } }
      const X0 = Math.max(0, Math.floor(x.x0)), Y0 = Math.max(0, Math.floor(x.y0)), X1 = Math.min(cv.width, Math.ceil(x.x1)), Y1 = Math.min(cv.height, Math.ceil(x.y1));
      if (X1 - X0 < 2 || Y1 - Y0 < 2) return x;
      const d = g.getImageData(X0, Y0, X1 - X0, Y1 - Y0).data, bg = [];
      for (let i = 0; i < d.length; i += 16) if (Math.abs(d[i] - r) + Math.abs(d[i + 1] - gg) + Math.abs(d[i + 2] - b) > 60) bg.push(lum(d[i], d[i + 1], d[i + 2]));
      if (bg.length < 8) return x;                                   // box is nearly all ink: can't judge
      bg.sort((a, c) => a - c); const Lb = bg[bg.length >> 1];
      return { ...x, cr: (Math.max(Lt, Lb) + .05) / (Math.min(Lt, Lb) + .05) };
    });
  };
})();`;
// settled moments: mid-scene and just before each exit (scenes), or after each morph lands (keys); else one per beat
function settledTimes(TL) {
  const D = TL.duration, out = [];
  if (TL.scenes) TL.scenes.forEach((s, i) => { const e = TL.scenes[i + 1] ? TL.scenes[i + 1].t : D; out.push(s.t + Math.min(.9, (e - s.t) * .5), e - .3); });
  else if (TL.keys) TL.keys.forEach((k, i) => { const e = TL.keys[i + 1] ? TL.keys[i + 1].t : D; out.push(Math.min(k.t + .6, (k.t + e) / 2), e - .15); });
  else { const b = 60 / (TL.bpm || 120); for (let t = .3; t < D; t += b) out.push(t); }
  return [...new Set(out.map(t => +t.toFixed(3)))].sort((a, b) => a - b);
}
// same defaults as the engines when they don't publish window.SAFEBOX
function defaultSafe(w, h) {
  const portrait = w / h < .9, S = portrait ? { l: .08, r: .12, t: .12, b: .18 } : { l: .07, r: .07, t: .09, b: .09 };
  return { x0: w * S.l, y0: h * S.t, x1: w * (1 - S.r), y1: h * (1 - S.b) };
}

(async () => {
  // sRGB output profile + no hinting: brand hex values land as sampled and glyphs don't shift between machines
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ['--allow-file-access-from-files', '--force-color-profile=srgb', '--font-render-hinting=none'] });
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  page.on('pageerror', e => { console.error('PAGE ERROR', e); process.exit(1); });
  page.on('console', m => m.type() === 'error' && console.error('console:', m.text()));
  // file:// blocks font CORS, so fonts travel as base64; the motion library is injected, not fetched
  // a missing font is a hole like a missing image: drafts fall back to sans-serif, video refuses below
  const fontHoles = [], fonts = (TL.fonts || []).filter(f => fs.existsSync(path.resolve(dir, f.file)) || (fontHoles.push(`font ${f.family}: ${f.file}`), false))
    .map(f => ({ ...f, b64: fs.readFileSync(path.resolve(dir, f.file)).toString('base64') }));
  const motion = fs.readFileSync(path.join(__dirname, '../lib/motion.js'), 'utf8');
  await page.addInitScript({ content: `${motion};window.TL=${tlText};window.FONTS=${JSON.stringify(fonts)};${mode === 'text' ? PROBE : ''}` });
  await page.goto(`file://${path.join(dir, 'index.html')}?size=${size}&lang=${lang}${opt.captions === '0' ? '&captions=0' : ''}`);
  await page.waitForFunction('window.ready === true', null, { timeout: 120000 });
  const bracketed = (o, at) => Object.entries(o || {}).flatMap(([k, v]) => typeof v === 'string' ? (/\[[^\]]+\]/.test(v) ? [`${at}.${k}`] : []) : v && typeof v === 'object' ? bracketed(v, `${at}.${k}`) : []);
  const holes = [...bracketed(TL.copy?.[lang], lang).map(k => `placeholder copy: ${k}`), ...fontHoles, ...await page.evaluate(() => window.MISSING || [])];
  if (holes.length) {
    console.error(`${holes.length} unfinished item(s):\n  ${holes.join('\n  ')}`);
    if (mode === 'video' && !opt['allow-placeholders']) { console.error('refusing to render video with placeholders (stills/sheet are fine)'); process.exit(3); }
  }
  const frame = async i => { await page.evaluate(([i, sub]) => window.renderFrame(i, sub ? { sub } : {}), [i, sub]); return page.screenshot({ type: 'png' }); };

  if (mode === 'stills') {
    const [out, ...ts] = rest; fs.mkdirSync(out, { recursive: true });
    for (const t of ts.map(Number)) fs.writeFileSync(path.join(out, `${tag}${lang}-${size}-${t.toFixed(2).padStart(6, '0')}.png`), await frame(Math.round(t * FPS)));
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
      // RGB -> BT.709 limited range, tagged: untagged yuv420p is guessed as BT.601 by players and shifts brand colours
      '-vf', 'scale=out_color_matrix=bt709:out_range=tv', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p',
      '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv', '-g', String(FPS * 2), out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let i = from; i < to; i++) {
      const b = await frame(i); if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r));
      if ((i - from) % (FPS * 2) === 0) console.error(`${path.basename(out)} ${i - from}/${to - from} ${((Date.now() - t0) / Math.max(1, i - from)).toFixed(0)} ms/frame`);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  } else if (mode === 'text') {
    const dur = TL.duration, ts = opt.at ? opt.at.split(',').map(Number) : settledTimes(TL);
    const safe = await page.evaluate(() => window.SAFEBOX || null) || defaultSafe(w, h);
    const floor = 22 * Math.min(w, h) / 1080, issues = new Map();
    const note = (kind, s, t, detail) => { const k = `${kind}|${s}`; if (!issues.has(k)) issues.set(k, { kind, s, ts: [], detail }); issues.get(k).ts.push(t); };
    for (const t of ts.filter(t => t >= 0 && t < dur)) {
      const T = await page.evaluate(i => { window.__PROBE = true; window.__TEXTS = []; window.renderFrame(i, { sub: 1 }); window.__PROBE = false; return window.__measure(); }, Math.round(t * FPS));
      const vis = T.filter(x => x.a > .5);
      for (const x of vis) {
        if (x.x0 < -1 || x.y0 < -1 || x.x1 > w + 1 || x.y1 > h + 1) note('CLIPPED', x.s, t, 'runs off the frame');
        else if (x.x0 < safe.x0 - 1 || x.y0 < safe.y0 - 1 || x.x1 > safe.x1 + 1 || x.y1 > safe.y1 + 1) note('unsafe', x.s, t, 'outside the safe box (platform UI)');
        if (x.px < floor - .5) note('small', x.s, t, `${x.px.toFixed(0)} px < ${floor.toFixed(0)} px floor`);
        if (x.cr && x.cr < (x.px >= 32 * Math.min(w, h) / 1080 ? 3 : 4.5)) note('contrast', x.s, t, `${x.cr.toFixed(2)}:1`);
      }
      for (let i = 0; i < vis.length; i++) for (let j = i + 1; j < vis.length; j++) {
        const A = vis[i], B = vis[j], ix = Math.max(0, Math.min(A.x1, B.x1) - Math.max(A.x0, B.x0)), iy = Math.max(0, Math.min(A.y1, B.y1) - Math.max(A.y0, B.y0));
        const inter = ix * iy, small = Math.min((A.x1 - A.x0) * (A.y1 - A.y0), (B.x1 - B.x0) * (B.y1 - B.y0)) || 1;
        if (A.s === B.s && inter / small > .8) continue;                // fill + stroke of the same caption
        if (inter / small > .15) note('overlap', `${A.s} / ${B.s}`, t, `${Math.round(100 * inter / small)} % of the smaller box`);
      }
    }
    console.log(`text check ${lang}${opt.variant ? ' variant ' + opt.variant : ''} ${size}: ${ts.length} settled samples, safe box ${[safe.x0, safe.y0, safe.x1, safe.y1].map(Math.round).join(',')}`);
    if (!issues.size) console.log('  clean');
    // persistence decides severity: an issue held over several samples is a defect; a single sample may be a transition
    for (const v of [...issues.values()].sort((a, b) => (b.kind === 'CLIPPED') - (a.kind === 'CLIPPED') || b.ts.length - a.ts.length))
      console.log(`  ${v.kind.padEnd(8)} "${v.s.slice(0, 48)}" ${v.detail} at ${v.ts.map(t => t.toFixed(2)).join(', ')} s`);
    if ([...issues.values()].some(v => v.kind === 'CLIPPED')) process.exitCode = 1;
  } else { console.error('unknown mode', mode); process.exitCode = 2; }
  await browser.close();
})();
