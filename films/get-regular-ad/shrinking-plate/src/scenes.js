// =====================================================================
//  SCENES — The Shrinking Plate. Each shot is one illustration (ChatGPT, 1024×1536) under a camera with intent,
//  plus what code does better: the foods leaving the plate, the 100-plates chart, the shelf refilling, the app screen.
//  Motion on 1s (STYLE.ones), so `export.mjs --blur N` gives every camera move real motion blur.
// =====================================================================
STYLE.ones = true;
STYLE.paper = GR.ink;
const P4 = { i: (t) => clamp(t) ** 4, o: (t) => 1 - (1 - clamp(t)) ** 4, io: (t) => { t = clamp(t); return t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2; } };
const IW = 1024, IH = 1536, BASE = H / IH;   // an illustration covers the 9:16 frame at 1.25×, 128 px trimmed each side

// ---- the camera on an illustration: image point (cx, cy) at the frame centre, scale BASE·z (clamped to cover unless free)
function view(z, cx, cy, free) {
  const S = BASE * z;
  if (!free) { const hw = W / 2 / S, hh = H / 2 / S; cx = clamp(cx, hw, IW - hw); cy = clamp(cy, hh, IH - hh); }
  return { S, cx, cy };
}
const toScr = (v, x, y) => [W / 2 + (x - v.cx) * v.S, H / 2 + (y - v.cy) * v.S];
function inView(v, fn) { ctx.save(); ctx.setTransform(v.S, 0, 0, v.S, W / 2 - v.cx * v.S, H / 2 - v.cy * v.S); fn(); ctx.restore(); }
function art(name, v, alpha = 1) {
  const img = asset(name); if (!img) return;
  inView(v, () => { ctx.globalAlpha *= alpha; ctx.drawImage(img, 0, 0, IW, IH); });
}
// a move from a to b over [t0, t1] with a mirrored power-4 ease
const glide = (a, b, t0, t1, e = P4.io) => lerp(a, b, e(seg(TT, t0, t1)));
const fill = (c, a = 1) => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = a; ctx.fillStyle = c; ctx.fillRect(0, 0, W, H); ctx.restore(); };
function sansT(str, x, y, px, color, o = {}) {
  ctx.save(); ctx.font = `${o.weight || 500} ${px}px ${HAND}`; ctx.fillStyle = color; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
  if (o.ls) ctx.letterSpacing = o.ls + 'px'; ctx.globalAlpha *= o.alpha ?? 1; ctx.fillText(str, x, y); ctx.restore();
}
function serifT(str, x, y, px, color, o = {}) {
  ctx.save(); ctx.font = `${o.italic ? 'italic ' : ''}500 ${px}px ${SERIF}`; ctx.fillStyle = color; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
  ctx.globalAlpha *= o.alpha ?? 1; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = o.blur ?? 24; } ctx.fillText(str, x, y); ctx.restore();
}
const source = (str, y, alpha, dark) => sansT(str, CX, y, 24, dark ? 'rgba(28,20,15,0.62)' : 'rgba(255,246,230,0.62)', { alpha, weight: 500 });

// =====================================================================
//  1 · THE PLATE — top-down; on each word one food lifts and leaves (gluten, dairy, onions, garlic)
// =====================================================================
const FOODS = [
  { key: 'S01b.png', cue: () => CU.bread, x: 412, y: 486, w: 205, rot: -0.14, dir: [-0.55, -0.85] },
  { key: 'S01c.png', cue: () => CU.cheese, x: 646, y: 472, w: 196, rot: 0.22, dir: [0.75, -0.65] },
  { key: 'S01d.png', cue: () => CU.onion, x: 392, y: 704, w: 122, rot: 0.1, dir: [-1, 0.15] },
  { key: 'S01e.png', cue: () => CU.garlic, x: 528, y: 792, w: 150, rot: 0, dir: [0.35, 1] },
];
function foodItem(f) {
  const img = asset(f.key); if (!img) return;
  const t0 = f.cue() + 0.06, lift = P4.o(seg(TT, t0, t0 + 0.2)), fly = P4.i(seg(TT, t0 + 0.12, t0 + 0.62));
  if (fly >= 1) return;
  const s = 1 + 0.13 * lift, dx = f.dir[0] * 1500 * fly, dy = f.dir[1] * 1500 * fly, h = f.w * img.height / img.width;
  ctx.save(); ctx.translate(f.x + dx, f.y + dy); ctx.rotate(f.rot + Math.sign(f.dir[0] || 1) * 0.9 * fly); ctx.scale(s, s);
  ctx.shadowColor = 'rgba(12,7,3,0.5)'; ctx.shadowBlur = 10 + 26 * lift; ctx.shadowOffsetY = 6 + 22 * lift; ctx.shadowOffsetX = 4 + 10 * lift;
  ctx.drawImage(img, -f.w / 2, -h / 2, f.w, h); ctx.restore();
}
function sPlate() {
  const t1 = TB.table;
  // a slow push, and each food that leaves nudges the camera a little closer to what's left
  const z = glide(1, 1.12, 0, t1, (u) => u) + FOODS.reduce((s, f) => s + 0.035 * springEase(TT - f.cue() - 0.15, SPRING.smooth.k, SPRING.smooth.d), 0);
  const v = view(z, 512, glide(768, 640, 0, t1, (u) => u));
  art('S01a.webp', v);
  inView(v, () => FOODS.forEach(foodItem));
}

// =====================================================================
//  2 · THE TABLE — the empty chair under the lamp ("her plate got smaller"); Nora fades into it ("the worry didn't")
// =====================================================================
function sTable() {
  const t0 = TB.table, t1 = TB.menu;
  const v = view(glide(1.2, 1.32, t0, t1, (u) => u), glide(520, 505, t0, t1), glide(1080, 640, t0 + 0.4, t1 - 0.2));
  art('S02-bg.webp', v);
  art('S02.webp', v, P4.o(seg(TT, CU.worry - 0.25, CU.worry + 0.65)));
}

// =====================================================================
//  3 · DINNER OUT — friends laughing; Nora behind the menu. The camera finds her.
// =====================================================================
function sMenu() {
  const t0 = TB.menu, t1 = TB.pov;
  art('S03.webp', view(glide(1.0, 1.42, t0, t1), 512, glide(768, 600, t0, t1)));
}
// 4 · "what's safe here?" — over her shoulder; a gold line runs under the item her finger is on
function sPov() {
  const t0 = TB.pov, t1 = TB.grid, v = view(glide(1.06, 1.24, t0, t1, (u) => u), glide(560, 700, t0, t1), glide(800, 820, t0, t1));
  art('S04.webp', v);
  const u = P4.o(seg(TT, CU.what + 0.1, CU.what + 0.7));
  if (u > 0) inView(v, () => {
    ctx.save(); ctx.strokeStyle = GR.glow; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.shadowColor = 'rgba(242,201,122,0.8)'; ctx.shadowBlur = 14;
    ctx.beginPath(); const n = 24;
    for (let i = 0; i <= n * u; i++) { const x = 648 + 236 * i / n, y = 842 - 14 * i / n + Math.sin(i * 0.9) * 2.2; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke(); ctx.restore();
    const q = popS(CU.safe + 0.15);
    if (q > 0) { ctx.save(); ctx.translate(905, 740); ctx.scale(q, q); ctx.rotate(0.12); ctx.font = `italic 500 120px ${SERIF}`; ctx.fillStyle = GR.glow; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.shadowColor = 'rgba(242,201,122,0.7)'; ctx.shadowBlur = 18; ctx.fillText('?', 0, 0); ctx.restore(); }
  });
}

// =====================================================================
//  5 · 100 PLATES (drawn) — up to 20 in 100 say a food upsets them; retested, it's closer to 2 or 3 (ACG 2021)
// =====================================================================
const GRID = { n: 10, pitch: 80, r: 29, x0: 540 - 4.5 * 80, y0: 520 };
const MARKS = (() => { const R = RNG('marks20'), all = [...Array(100).keys()]; for (let i = 99; i > 0; i--) { const j = Math.floor(R.f() * (i + 1)); [all[i], all[j]] = [all[j], all[i]]; } return all.slice(0, 20); })();
const GOLD = MARKS.slice(0, 3);
function plateDot(x, y, r, o) {
  ctx.save(); ctx.translate(x, y); ctx.scale(o.s, o.s);
  ctx.shadowColor = o.gold > 0 ? `rgba(242,201,122,${0.9 * o.gold})` : 'rgba(0,0,0,0.45)'; ctx.shadowBlur = o.gold > 0 ? 34 * o.gold : 8; ctx.shadowOffsetY = o.gold > 0 ? 0 : 4;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fillStyle = o.gold > 0 ? mixHex(GR.bone, GR.glow, o.gold) : GR.bone; ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.beginPath(); ctx.arc(0, 0, r * 0.66, 0, TAU); ctx.strokeStyle = 'rgba(120,95,70,0.28)'; ctx.lineWidth = 2; ctx.stroke();
  if (o.mark > 0) {   // a little meal on the plate, the one that "upsets"
    ctx.globalAlpha = o.mark; const R = RNG('food', x, y);
    [[-7, -4, 9, GR.terra], [7, -2, 8, GR.ochre], [0, 8, 7, GR.goldD]].forEach(([fx, fy, fr, c]) => { ctx.beginPath(); ctx.arc(fx + R.n(2), fy + R.n(2), fr, 0, TAU); ctx.fillStyle = c; ctx.fill(); });
  }
  ctx.restore();
}
function counter(big, y, a) {   // "<big> in 100", centred as one line
  ctx.save(); ctx.font = `500 168px ${SERIF}`; const wb = ctx.measureText(big).width; ctx.font = `500 84px ${SERIF}`; const ws = ctx.measureText(' in 100').width; ctx.restore();
  const x0 = CX - (wb + ws) / 2;
  serifT(big, x0, y, 168, GR.glow, { alpha: a, glow: 'rgba(242,201,122,0.55)', align: 'left' });
  serifT(' in 100', x0 + wb, y + 14, 84, GR.cream, { alpha: a, align: 'left' });
}
function sGrid(second) {
  const t0 = second ? TB.grid2 : TB.grid;
  fill(GR.ink);
  { const g = ctx.createRadialGradient(540, 700, 60, 540, 860, 900); g.addColorStop(0, 'rgba(242,201,122,0.13)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.save(); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  const z = second ? glide(1.06, 1.1, t0, TB.shelf, (u) => u) : glide(1.0, 1.06, t0, TB.onion, (u) => u);
  ctx.save(); ctx.translate(540, 880); ctx.scale(z, z); ctx.translate(-540, -880);
  for (let i = 0; i < 100; i++) {
    const r = Math.floor(i / 10), c = i % 10, x = GRID.x0 + c * GRID.pitch, y = GRID.y0 + r * GRID.pitch;
    const s = second ? 1 : EZ.back(seg(TT, t0 + 0.05 + (r + c) * 0.016, t0 + 0.3 + (r + c) * 0.016));
    const k = MARKS.indexOf(i), isGold = GOLD.includes(i);
    let mark = 0, gold = 0, ps = s;
    if (k >= 0) {
      if (!second) { const tm = CU.twenty + 0.08 + k * 0.035; mark = clamp((TT - tm) / 0.18); ps *= 1 + 0.16 * Math.sin(Math.PI * clamp((TT - tm) / 0.3)); }
      else if (isGold) { const tg = CU.two + 0.12 + GOLD.indexOf(i) * 0.14; mark = 1; gold = P4.o(seg(TT, tg, tg + 0.4)); ps *= 1 + 0.22 * Math.sin(Math.PI * clamp((TT - tg) / 0.35)); }
      else { const tf = CU.two - 0.05 + k * 0.012; mark = 1 - clamp((TT - tf) / 0.3); }
    }
    plateDot(x, y, GRID.r, { s: ps, mark, gold });
  }
  ctx.restore();
  // the counter
  const a1 = second ? 1 - clamp((TT - (CU.two - 0.1)) / 0.2) : ev(CU.twenty - 0.05, 0.2);
  if (a1 > 0) { counter('20', 318, a1); sansT('SAY A FOOD UPSETS THEM', CX, 432, 28, 'rgba(255,246,230,0.75)', { alpha: a1, ls: 5, weight: 700 }); }
  if (second) {
    const a2 = ev(CU.two + 0.05, 0.25), dy = 24 * (1 - P4.o(ev(CU.two + 0.05, 0.35)));
    if (a2 > 0) { counter('2–3', 318 + dy, a2); sansT('REACT AGAIN WHEN RETESTED', CX, 432 + dy, 28, 'rgba(255,246,230,0.75)', { alpha: a2, ls: 5, weight: 700 }); }
  }
  source('Source: ACG Clinical Guideline, IBS · Am J Gastroenterol 2021', 1296, second ? 1 : ev(CU.people, 0.4));
}

// 6 · "carefully tested again" — one food under the spotlight; the light comes on as we cut in
function sOnion() {
  const t0 = TB.onion, v = view(glide(1.02, 1.2, t0, TB.grid2, (u) => u), 530, glide(820, 880, t0, TB.grid2));
  art('S05.webp', v);
  const on = P4.o(seg(TT, t0 + 0.12, t0 + 0.42)) * (TT < t0 + 0.2 ? 0.55 : 1);
  fill('#000', 0.78 * (1 - on));
}

// =====================================================================
//  7 · THE SHELF — built to end: the empty shelf refills, one group of foods at a time (Monash)
// =====================================================================
const ROWS = [[56, 322], [318, 642], [636, 1016]];
function sShelf() {
  const t0 = TB.shelf, t1 = TB.kitchen;
  fill(GR.wall);
  const v = view(glide(0.84, 0.9, t0, t1, (u) => u), 512, glide(540, 560, t0, t1), true);
  art('S06a.webp', v);
  const img = asset('S06b.webp'), when = [CU.back - 0.5, CU.group - 0.3, CU.time - 0.06];
  if (img) ROWS.forEach(([y0, y1], i) => {
    const tr = when[i]; if (TT < tr) return;
    const dy = springMove(tr, -46, 0, SPRING.playful), a = clamp((TT - tr) / 0.12);
    inView(v, () => { ctx.beginPath(); ctx.rect(0, y0, IW, y1 - y0); ctx.clip(); ctx.globalAlpha = a; ctx.drawImage(img, 0, dy, IW, IH); });
  });
  source('Source: Monash University · low FODMAP: 2–6 weeks out, then reintroduce', 452, ev(CU.weeks, 0.4), true);
}

// 8 · THE KITCHEN — a fuller plate; the camera rises from the plate to her smile (up = the conclusion)
function sKitchen() {
  const t0 = TB.kitchen, t1 = TB.phone;
  art('S07.webp', view(glide(1.32, 1.14, t0, t1), 518, glide(860, 600, t0 + 0.2, t1 - 0.3)));
  const g = ctx.createRadialGradient(520, 980, 40, 520, 980, 760), a = 0.22 * ev(CU.surer - 0.2, 0.8);
  g.addColorStop(0, `rgba(242,201,122,${a})`); g.addColorStop(1, 'rgba(242,201,122,0)'); ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
}

// =====================================================================
//  9 · THE PHONE — push into the blank screen; an illustrative log (meals, symptoms, a week) and the gold pattern line
// =====================================================================
const SCREEN = { x0: 433, y0: 633, x1: 559, y1: 885 };
function sPhone() {
  const t0 = TB.phone, t1 = TB.friends;
  const z = glide(1.0, 2.25, t0 + 0.05, CU.log + 0.25) + glide(0, 0.08, CU.log + 0.25, t1, (u) => u);
  const v = view(z, glide(512, 496, t0, CU.log + 0.25), glide(768, 815, t0, CU.log + 0.25));
  art('S08.webp', v);
  const [ax, ay] = toScr(v, SCREEN.x0, SCREEN.y0), [bx, by] = toScr(v, SCREEN.x1, SCREEN.y1), k = (bx - ax) / 300;
  ctx.save(); ctx.beginPath(); ctx.roundRect(ax, ay, bx - ax, by - ay, 15 * v.S); ctx.clip();
  ctx.fillStyle = '#F7F1E6'; ctx.fillRect(ax, ay, bx - ax, by - ay);
  ctx.translate(ax, ay); ctx.scale(k, k);   // a 300 × 600 virtual screen
  const on = ev(CU.log - 0.35, 0.3); ctx.globalAlpha = on;
  ctx.font = `700 20px ${HAND}`; ctx.fillStyle = GR.goldD; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('TODAY', 24, 44);
  ctx.font = `500 30px ${SERIF}`; ctx.fillStyle = GR.ink; ctx.fillText('Your log', 24, 82);
  const row = (t, y, dot, title, sub) => {
    const a = ev(t, 0.22), dx = 30 * (1 - P4.o(ev(t, 0.35))); if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(dx, 0);
    ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.roundRect(16, y - 32, 268, 64, 16); ctx.fill();
    ctx.fillStyle = dot; ctx.beginPath(); ctx.arc(46, y, 13, 0, TAU); ctx.fill();
    ctx.font = `700 19px ${HAND}`; ctx.fillStyle = GR.ink; ctx.fillText(title, 72, y - 9);
    ctx.font = `500 16px ${HAND}`; ctx.fillStyle = GR.taupe; ctx.fillText(sub, 72, y + 13); ctx.restore();
  };
  row(CU.meals, 150, GR.ochre, 'Dinner', 'pasta, garlic, salad');
  row(CU.symptoms, 226, GR.taupe, 'Bloating', 'mild · 2 h later');
  // the week, side by side: meals (dots) over symptoms (bars); the pattern line threads the days that repeat
  const wk = ev(CU.side - 0.1, 0.3);
  if (wk > 0) {
    ctx.save(); ctx.globalAlpha *= wk;
    ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.roundRect(16, 282, 268, 210, 16); ctx.fill();
    ctx.font = `700 16px ${HAND}`; ctx.fillStyle = GR.goldD; ctx.fillText('THIS WEEK', 32, 308);
    const days = 'MTWTFSS', meal = [1, 0, 1, 0, 0, 1, 0], sym = [0.75, 0.2, 0.8, 0.15, 0.2, 0.7, 0.1], pts = [];
    for (let d = 0; d < 7; d++) {
      const x = 46 + d * 35, ad = clamp((TT - (CU.side + d * 0.06)) / 0.2);
      ctx.save(); ctx.globalAlpha *= ad;
      ctx.font = `600 14px ${HAND}`; ctx.fillStyle = GR.taupe; ctx.textAlign = 'center'; ctx.fillText(days[d], x, 470);
      ctx.fillStyle = meal[d] ? GR.ochre : '#E2D8C6'; ctx.beginPath(); ctx.arc(x, 342, 8, 0, TAU); ctx.fill();
      const bh = 80 * sym[d]; ctx.fillStyle = '#CDBFAE'; ctx.beginPath(); ctx.roundRect(x - 7, 448 - bh, 14, bh, 6); ctx.fill();
      ctx.restore(); pts.push([x, 448 - bh - 12]);
    }
    const pu = P4.io(seg(TT, CU.patterns - 0.15, CU.patterns + 0.6));
    if (pu > 0) {
      const hit = [0, 2, 5].map((d) => pts[d]);
      ctx.save(); ctx.strokeStyle = GR.gold; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.shadowColor = 'rgba(196,168,130,0.9)'; ctx.shadowBlur = 10;
      ctx.beginPath(); const L = hit.length - 1, f = pu * L;
      hit.forEach((p, i) => { if (i === 0) ctx.moveTo(p[0], p[1]); else if (i <= f) ctx.lineTo(p[0], p[1]); else if (i - 1 < f) ctx.lineTo(lerp(hit[i - 1][0], p[0], f - (i - 1)), lerp(hit[i - 1][1], p[1], f - (i - 1))); });
      ctx.stroke();
      hit.forEach((p, i) => { if (i <= f + 0.01) { ctx.beginPath(); ctx.arc(p[0], p[1], 6, 0, TAU); ctx.fillStyle = GR.gold; ctx.fill(); } });
      ctx.restore();
    }
    ctx.restore();
  }
  // bring foods back: one food, tried again
  const bk = popS(CU.bring + 0.05);
  if (bk > 0) {
    ctx.save(); ctx.translate(150, 538); ctx.scale(bk, bk);
    ctx.fillStyle = GR.gold; ctx.beginPath(); ctx.roundRect(-128, -26, 256, 52, 26); ctx.fill();
    ctx.font = `700 18px ${HAND}`; ctx.fillStyle = GR.ink; ctx.textAlign = 'center'; ctx.fillText('Onion · tried again  ✓', 0, 1); ctx.restore();
  }
  ctx.restore();
}

// =====================================================================
//  10 · DINNER OUT, AGAIN — laughing, a full plate. End card: logo, the line, the download button.
// =====================================================================
const END0 = () => CU.start - 0.3;
function sFriends() {
  const t0 = TB.friends;
  art('S09.webp', view(glide(1.0, 1.12, t0, DURATION, (u) => u), 512, glide(700, 640, t0, DURATION)));
  const e = P4.o(ev(END0(), 0.6)); if (e <= 0) return;
  const g = ctx.createLinearGradient(0, 860, 0, H); g.addColorStop(0, 'rgba(28,20,15,0)'); g.addColorStop(0.35, `rgba(28,20,15,${0.82 * e})`); g.addColorStop(1, `rgba(28,20,15,${0.95 * e})`);
  ctx.save(); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  const logo = asset('logo-white.svg'), la = ev(END0() + 0.1, 0.4), ly = 1150 + 30 * (1 - P4.o(ev(END0() + 0.1, 0.5)));
  if (logo) { ctx.save(); ctx.globalAlpha = la; const w = 380, h = w * 84 / 242; ctx.drawImage(logo, CX - w / 2, ly - h / 2, w, h); ctx.restore(); }
  serifT('Start with tonight’s plate.', CX, 1300 + 24 * (1 - P4.o(ev(CU.start, 0.5))), 66, GR.cream, { italic: true, alpha: ev(CU.start, 0.35) });
  const tb = CU.start + 0.75, bs = popS(tb), press = TT > tb + 1.3 ? 1 - 0.06 * Math.sin(Math.PI * clamp((TT - tb - 1.3) / 0.22)) : 1;
  if (bs > 0) {
    ctx.save(); ctx.translate(CX, 1430); ctx.scale(bs * press, bs * press);
    ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 6; ctx.fillStyle = GR.gold; ctx.beginPath(); ctx.roundRect(-290, -48, 580, 96, 48); ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.font = `700 38px ${HAND}`; ctx.fillStyle = GR.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Download Get Regular', 0, 2); ctx.restore();
    const rp = clamp((TT - tb - 1.32) / 0.6); if (rp > 0 && rp < 1) { ctx.save(); ctx.strokeStyle = `rgba(242,201,122,${0.7 * (1 - rp)})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(CX - 290 - 40 * rp, 1430 - 48 - 40 * rp, 580 + 80 * rp, 96 + 80 * rp, 48 + 40 * rp); ctx.stroke(); ctx.restore(); }
  }
}

// =====================================================================
//  POST — light grain + vignette over every shot; captions in the reference's centred serif (ink on the bright shelf)
// =====================================================================
const CAPS = (() => {
  const out = [];
  VLINES.forEach((l) => {
    // sentences first (. ? ! :), then a comma with 3+ words each side, then long chunks split in the middle
    const ws = l.words || [], parts = []; let cur = [];
    ws.forEach((w, i) => { cur.push(w); const rest = ws.length - 1 - i; if (/[.?!:]$/.test(w.w) || (/,$/.test(w.w) && cur.length >= 3 && rest >= 3) || i === ws.length - 1) { parts.push(cur); cur = []; } });
    const split = (c) => (c.length > 7 ? [...split(c.slice(0, Math.ceil(c.length / 2))), ...split(c.slice(Math.ceil(c.length / 2)))] : [c]);
    parts.flatMap(split).forEach((c) => out.push({ t0: Math.max(c[0].t0, l.t0), words: c }));
  });
  out.forEach((c, i) => { const last = c.words[c.words.length - 1].t1, nx = out[i + 1]; c.t1 = nx ? Math.min(nx.t0, last + 0.7) : last + 0.7; c.text = c.words.map((w) => w.w).join(' '); });
  return out;
})();
function wrap(str, px, maxW) {
  ctx.font = `500 ${px}px ${SERIF}`; const words = str.split(' '), lines = []; let cur = '';
  words.forEach((w) => { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; });
  if (cur) lines.push(cur); return lines;
}
function captions() {
  if (TT >= END0()) return;
  const c = CAPS.find((q) => TT >= q.t0 - 0.04 && TT < q.t1); if (!c) return;
  const e = eraAt(TT), light = e === 7, px = 64, lines = wrap(c.text, px, 900);
  const y0 = light ? 330 : (e === 1 && c.t0 < CU.worry - 0.2 ? 1130 : 1400) - (lines.length - 1) * 38;
  const a = clamp((TT - c.t0 + 0.04) / 0.12) * clamp((c.t1 - TT) / 0.1), dy = 10 * (1 - P4.o(clamp((TT - c.t0 + 0.04) / 0.25)));
  ctx.save(); ctx.globalAlpha = a; ctx.font = `500 ${px}px ${SERIF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = light ? GR.ink : GR.cream; ctx.shadowColor = light ? 'rgba(255,250,240,0.9)' : 'rgba(10,5,2,0.75)'; ctx.shadowBlur = light ? 14 : 22; ctx.shadowOffsetY = light ? 0 : 3;
  lines.forEach((ln, i) => ctx.fillText(ln, CX, y0 + i * 76 + dy));
  ctx.restore();
}
STYLE.post = () => {
  grain({ n: 1500, dark: 'rgba(20,10,4,0.10)', light: 'rgba(255,240,215,0.07)' });
  const g = ctx.createRadialGradient(540, 900, 520, 540, 960, 1250); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(10,5,2,0.38)');
  ctx.save(); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  if (eraAt(TT) !== 7 && TT < END0()) {   // a soft dark bed so the cream captions read on busy pictures
    const b = ctx.createLinearGradient(0, 1180, 0, 1640); b.addColorStop(0, 'rgba(12,7,3,0)'); b.addColorStop(0.5, 'rgba(12,7,3,0.34)'); b.addColorStop(1, 'rgba(12,7,3,0)');
    ctx.save(); ctx.fillStyle = b; ctx.fillRect(0, 1180, W, 460); ctx.restore();
  }
  captions();
};
