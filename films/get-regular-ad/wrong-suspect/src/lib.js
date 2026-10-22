// =====================================================================
//  LIB — the piece's own drawing helpers on top of the cut-paper kit: brand palette, type, window light,
//  food, plates, carriages, the track, symptom clouds, bathroom rolls, day cards, stamps and the caption rail.
//  Everything derives from TT / B (deterministic); static geometry is computed once from constants.
// =====================================================================
// the kit's props in the brand's muted palette (the kit reads PAL at draw time)
Object.assign(PAL, { ink: GR.ink, paper: GR.paper, green: GR.sage, greenD: GR.sageD, blue: GR.dusk, wood: GR.wood, woodD: GR.woodD, woodL: GR.woodL, charcoal: '#5d5652' });
STYLE.paper = '#E9E1D4';

// ---- type: the serif accent (italic) and the brand sans
function serif(str, x, y, size, color, o = {}) {
  ctx.save();
  const R = RNG('sf', o.key ?? str, B);
  ctx.translate(x + R.n(0.5), y + R.n(0.5)); ctx.rotate(o.rot ?? 0);
  ctx.font = `italic 400 ${size}px ${SERIF}`; ctx.fillStyle = color; ctx.textAlign = o.align ?? 'center'; ctx.textBaseline = 'alphabetic';
  const w = ctx.measureText(str).width, frac = clamp(o.frac ?? 1);
  if (frac <= 0) { ctx.restore(); return w; }
  if (frac < 1) { const x0 = o.align === 'left' ? 0 : o.align === 'right' ? -w : -w / 2; ctx.beginPath(); ctx.rect(x0 - 8, -size * 1.1, (w + 16) * frac, size * 1.7); ctx.clip(); }
  ctx.fillText(str, 0, 0); ctx.restore(); return w;
}
function sans(str, x, y, size, color, o = {}) {
  ctx.save();
  ctx.font = `${o.weight ?? 500} ${size}px ${HAND}`; ctx.fillStyle = color; ctx.textAlign = o.align ?? 'center'; ctx.textBaseline = 'alphabetic';
  if (o.ls) ctx.letterSpacing = o.ls;
  ctx.translate(x, y); ctx.rotate(o.rot ?? 0); ctx.fillText(str, 0, 0);
  const w = ctx.measureText(str).width; ctx.restore(); return w;
}
const fontW = (str, font) => { ctx.save(); ctx.font = font; const w = ctx.measureText(str).width; ctx.restore(); return w; };
// a torn paper label with a serif word on it
function label(str, x, y, size, o = {}) {
  const s = o.s ?? 1; if (s <= 0.01) return;
  const w = fontW(str, `italic 400 ${size}px ${SERIF}`) + size * 0.8, h = size * 1.25;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.03); ctx.scale(s, s);
  cut(rect(-w / 2, -h / 2, w, h, 3), o.fill ?? GR.paper, { key: 'lb' + str, tear: 1.4, sb: 6, sy: 4 });
  serif(str, 0, size * 0.3, size, o.color ?? GR.ink, { key: 'lbt' + str, frac: o.frac });
  ctx.restore();
}
// the red rubber stamp: RED means blame, nothing else
function stamp(str, x, y, size, o = {}) {
  const s = o.s ?? 1; if (s <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.12); ctx.scale(s, s);
  ctx.font = `700 ${size}px ${HAND}`; ctx.letterSpacing = `${size * 0.12}px`;
  const w = ctx.measureText(str).width + size * 0.9, h = size * 1.55;
  ctx.letterSpacing = '0px';
  cut(rect(-w / 2, -h / 2, w, h, 6), 'rgba(251,248,242,0.92)', { key: 'stp' + str, tear: 0.8, sb: 5, sy: 3, grain: 0.4 });
  ink(rrectPts(-w / 2 + 7, -h / 2 + 7, w - 14, h - 14, 6), { closed: true, w: size * 0.09, color: GR.red, amt: 0.7, key: 'stpo' + str });
  sans(str, 0, size * 0.36, size, GR.red, { weight: 700, ls: `${size * 0.12}px` });
  const R = RNG('stpk', str);   // ink that didn't take: paper specks over the stamp
  ctx.fillStyle = 'rgba(251,248,242,0.55)'; ctx.beginPath();
  for (let i = 0; i < 140; i++) ctx.rect(R.r(-w / 2, w / 2), R.r(-h / 2, h / 2), R.r(1.5, 4), R.r(1.5, 3));
  ctx.fill();
  ctx.restore();
}
// a stamp slams down: big and late, then exactly on its target
const slam = (t) => (TT < t ? 0 : 1 + 0.55 * (1 - EZ.o3(clamp((TT - t) / 0.16))));

// ---- light: soft diagonal window light across a wall (the reference's afternoon-sun grammar)
function windowLight(o = {}) {
  const a = o.a ?? 0.2, drift = Math.sin(TT * 0.3) * 8;
  ctx.save(); ctx.translate(W * 0.5, H * 0.42); ctx.rotate(o.ang ?? -0.6);
  for (const [x, w] of o.bands ?? [[-560, 170], [-330, 120], [-150, 190], [110, 100], [300, 150]]) {
    const g = ctx.createLinearGradient(x + drift, 0, x + w + drift, 0);
    g.addColorStop(0, 'rgba(255,246,226,0)'); g.addColorStop(0.5, `rgba(255,246,226,${a})`); g.addColorStop(1, 'rgba(255,246,226,0)');
    ctx.fillStyle = g; ctx.fillRect(x + drift, -2000, w, 4000);
  }
  ctx.restore();
  const v = ctx.createRadialGradient(W / 2, H * 0.45, H * 0.3, W / 2, H * 0.45, H * 0.8);
  v.addColorStop(0, 'rgba(60,40,20,0)'); v.addColorStop(1, `rgba(60,40,20,${o.vig ?? 0.16})`);
  ctx.fillStyle = v; ctx.fillRect(-40, -40, W + 80, H + 80);
}
function wall(c, o = {}) {
  cut(rect(-40, -40, W + 80, H + 80, 0), c, { key: o.key ?? 'wall', shadow: false, tear: 0, shade: false, grain: 0.7, pat: o.pat });
}

// ---- food (top-down paper cut-outs). kinds: salmon rice greens broccoli bread cheese toast coffee sandwich apple pasta
function food(kind, x, y, s = 1, o = {}) {
  const k = (o.key ?? 'f') + kind;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? 0); ctx.scale(s, s);
  switch (kind) {
    case 'salmon':
      cut(rect(-62, -30, 124, 60, 24), GR.terra, { key: k, sb: 6, sy: 4, pat: pat.stripes('rgba(255,240,225,0.55)', 4, 18, 0.5) });
      cut(rect(-62, 14, 124, 16, 8), '#B8B1A8', { key: k + 'sk', shadow: false, grain: 0.4 }); break;
    case 'rice':
      cut(ellipsePts(0, 0, 54, 40, 0, 26), '#F8F4EA', { key: k, sb: 6, sy: 4, pat: pat.dots('rgba(205,190,165,0.6)', 3, 13) }); break;
    case 'greens':
      for (let i = 0; i < 4; i++) { const a = i * 1.5 + 0.3; cut(rot(ellipsePts(Math.cos(a) * 18, Math.sin(a) * 14, 34, 14, 0, 14), Math.cos(a) * 18, Math.sin(a) * 14, a), i % 2 ? GR.sage : GR.sageD, { key: k + i, sb: 4, sy: 3, tear: 0.8 }); } break;
    case 'broccoli':
      cut(rect(-9, 4, 18, 34, 6), '#B9C6A4', { key: k + 's', sb: 3, sy: 2 });
      for (let i = 0; i < 3; i++) cut(ellipsePts(-18 + i * 18, -6 - (i % 2) * 10, 20, 18, 0, 16), GR.sageD, { key: k + i, sb: 4, sy: 3, pat: pat.dots('rgba(255,255,255,0.18)', 2, 8) }); break;
    case 'bread': case 'toast':
      cut([[-42, 40], [-46, -14], [-30, -40], [0, -48], [30, -40], [46, -14], [42, 40]], '#B98858', { key: k + 'c', sb: 6, sy: 4 });
      cut([[-32, 32], [-35, -10], [-22, -30], [0, -36], [22, -30], [35, -10], [32, 32]], kind === 'toast' ? '#D9B47E' : GR.butter, { key: k, shadow: false, pat: pat.dots('rgba(170,130,80,0.25)', 2, 11) }); break;
    case 'cheese':
      cut([[-46, 26], [46, 26], [30, -30]], GR.butter, { key: k, sb: 6, sy: 4 });
      [[-10, 12, 6], [12, 6, 4], [20, -10, 5]].forEach(([a, b, r], i) => cut(ellipsePts(a, b, r, r, 0, 10), '#D8C58F', { key: k + i, shadow: false, grain: false })); break;
    case 'coffee':
      cut(ellipsePts(0, 0, 52, 52, 0, 30), '#F4EFE6', { key: k + 'sa', sb: 6, sy: 4 });
      cut(ellipsePts(0, 0, 34, 34, 0, 26), '#FFFFFF', { key: k + 'cu', sb: 3, sy: 2 });
      cut(ellipsePts(0, 0, 26, 26, 0, 24), '#6E4A34', { key: k + 'co', shadow: false, grain: 0.3 });
      cut(rect(30, -6, 26, 12, 6), '#FFFFFF', { key: k + 'h', sb: 3, sy: 2 }); break;
    case 'sandwich':
      cut([[-50, 34], [50, 34], [-50, -40]], '#C9A06E', { key: k + 'c', sb: 6, sy: 4 });
      cut([[-40, 26], [34, 26], [-40, -28]], GR.butter, { key: k, shadow: false });
      cut([[-46, 30], [44, 30], [44, 36], [-46, 36]], GR.sage, { key: k + 'l', shadow: false, tear: 2 }); break;
    case 'apple':
      cut(ellipsePts(0, 4, 36, 34, 0, 26), GR.blush, { key: k, sb: 6, sy: 4, crayon: '#D49C86', crAl: 0.35 });
      cut(rect(-3, -40, 6, 14, 3), GR.woodD, { key: k + 's', shadow: false });
      cut(rot(ellipsePts(12, -30, 12, 6, 0, 10), 12, -30, -0.5), GR.sage, { key: k + 'l', shadow: false }); break;
    case 'pasta':
      cut(ellipsePts(0, 0, 50, 42, 0, 26), GR.butter, { key: k, sb: 6, sy: 4 });
      for (let i = 0; i < 4; i++) ink(arcPts(0, 0, 14 + i * 8, i, i + 4.2, 14), { w: 3, color: '#D5BE84', amt: 0.5, key: k + 'sw' + i });
      cut(ellipsePts(6, -4, 16, 12, 0, 14), GR.terra, { key: k + 'sauce', shadow: false, grain: 0.3 }); break;
  }
  ctx.restore();
}
// a plate in perspective (dinner) or seen from above (r only)
function plate(x, y, rx, ry, o = {}) {
  const k = o.key ?? 'pl';
  cut(ellipsePts(x, y, rx, ry, 0, 48), '#FBF9F4', { key: k + 'o', sb: 14, sy: 8, shade: false, grain: 0.4 });
  cut(ellipsePts(x, y + ry * 0.03, rx * 0.72, ry * 0.72, 0, 44), '#F3EEE5', { key: k + 'i', shadow: false, grain: 0.4, shade: false });
}

// ---- symptom cloud (a feeling, not a body): grey paper cloud with a small face
function cloudy(x, y, s = 1, o = {}) {
  if (s <= 0.01) return;
  const k = o.key ?? 'cl', bob = Math.sin(TT * TAU * 0.6 + k.length) * 5 * s;
  ctx.save(); ctx.translate(x, y + bob); ctx.scale(s, s);
  const lumps = [[-58, 10, 42], [-18, -18, 52], [34, -8, 46], [66, 16, 34]];
  cut([...ellipsePts(0, 22, 100, 34, 0, 30)], o.c ?? GR.cloud, { key: k + 'b', sb: 10, sy: 6 });
  lumps.forEach(([a, b, r], i) => cut(ellipsePts(a, b, r, r * 0.92, 0, 24), o.c ?? GR.cloud, { key: k + i, shadow: false, grain: 0.6 }));
  if (o.face !== false) face(4, 6, 0.75, o.mood ?? 'sad');
  if (o.rain) for (let i = 0; i < 3; i++) { const yy = mod(TT * 120 + i * 30, 70); cut(ellipsePts(-40 + i * 40, 70 + yy, 5, 9, 0, 10), GR.cloudD, { key: k + 'r' + i, shadow: false, grain: false }); }
  ctx.restore();
}
// ---- bathroom: a toilet-paper roll (side view)
function roll(x, y, s = 1, o = {}) {
  if (s <= 0.01) return;
  const k = o.key ?? 'ro';
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  cut(rect(-34, -30, 68, 64, 8), '#FFFFFF', { key: k + 'b', sb: 6, sy: 4, pat: pat.lines('rgba(180,170,155,0.35)', 12, 6) });
  cut(ellipsePts(0, -30, 34, 12, 0, 22), '#F2EEE7', { key: k + 't', shadow: false });
  cut(ellipsePts(0, -30, 12, 5, 0, 14), GR.taupe, { key: k + 'h', shadow: false, grain: false });
  cut([[34, 0], [52, 0], [52, 48], [34, 44]], '#FFFFFF', { key: k + 's', sb: 3, sy: 2 });
  ctx.restore();
}

// ---- the track: one long paper railway through the body (stylised, not anatomy)
const TRACK = (() => {
  const P = [], run = (x0, x1, y) => { for (let k = 0; k <= 30; k++) P.push([lerp(x0, x1, k / 30), y]); };
  const arc = (cx, cy, r, a0, a1) => { for (let k = 1; k < 24; k++) { const a = lerp(a0, a1, k / 24); P.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  const R = 125, Y = [530, 780, 1030, 1280];
  run(150, 860, Y[0]); arc(860, Y[0] + R, R, -Math.PI / 2, Math.PI / 2);
  run(860, 220, Y[1]); arc(220, Y[1] + R, R, -Math.PI / 2, -Math.PI * 1.5);
  run(220, 860, Y[2]); arc(860, Y[2] + R, R, -Math.PI / 2, Math.PI / 2);
  run(860, -120, Y[3]);
  const Q = resample(P, false, 6), N = Q.map((p, i) => { const a = Q[Math.max(0, i - 2)], b = Q[Math.min(Q.length - 1, i + 2)], l = dist(a, b) || 1; return [-(b[1] - a[1]) / l, (b[0] - a[0]) / l]; });
  return { P: Q, N, L: pathLen(Q) };
})();
const off = (d) => TRACK.P.map((p, i) => [p[0] + TRACK.N[i][0] * d, p[1] + TRACK.N[i][1] * d]);
const RAIL_A = off(-17), RAIL_B = off(17);
function track() {
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(40,25,10,0.25)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 7;
  ctx.strokeStyle = '#E0CDB7'; ctx.lineWidth = 74; trace(TRACK.P, false); ctx.stroke();
  ctx.restore();
  ctx.save(); ctx.strokeStyle = 'rgba(150,120,90,0.35)'; ctx.lineWidth = 6; ctx.beginPath();
  for (let i = 0; i < TRACK.P.length; i += 5) { const [x, y] = TRACK.P[i], [nx, ny] = TRACK.N[i]; ctx.moveTo(x - nx * 28, y - ny * 28); ctx.lineTo(x + nx * 28, y + ny * 28); }
  ctx.stroke(); ctx.restore();
  ink(RAIL_A, { w: 4.5, color: GR.taupe, amt: 0.6, key: 'railA' });
  ink(RAIL_B, { w: 4.5, color: GR.taupe, amt: 0.6, key: 'railB' });
}
const trackAt = (f) => (f <= 0 ? [TRACK.P[0][0] + f * TRACK.L, TRACK.P[0][1]] : f >= 1 ? [TRACK.P[TRACK.P.length - 1][0] - (f - 1) * TRACK.L, TRACK.P[TRACK.P.length - 1][1]] : pointAt(TRACK.P, f));

// ---- a carriage (open wagon) whose cargo is a meal; (x, y) = where its wheels meet the rail
const CAR = { w: 186, h: 92 };
const carBody = (x, y, s = 1) => rect(x - CAR.w * s / 2, y - (CAR.h + 22) * s, CAR.w * s, CAR.h * s, 20 * s);
function carriage(x, y, foods, c, o = {}) {
  const s = o.s ?? 1, k = o.key ?? 'car'; if (s <= 0.01) return;
  const jig = Math.sin(TT * 9 + k.length) * (o.moving ? 2.5 : 0.6);
  y += jig;
  foods.forEach((f, i) => food(f, x + (i - (foods.length - 1) / 2) * 62 * s, y - (CAR.h + 30) * s, 0.62 * s, { key: k + i, rot: (i - 0.5) * 0.2 }));
  cut(carBody(x, y, s), c, { key: k + 'b', sb: 8, sy: 5, pat: pat.stripes('rgba(255,255,255,0.16)', 10 * s, 34 * s) });
  cut(rect(x - CAR.w * s / 2 - 6 * s, y - (CAR.h + 30) * s, (CAR.w + 12) * s, 16 * s, 6 * s), GR.paper, { key: k + 'rim', sb: 4, sy: 3 });
  for (const dx of [-0.3, 0.3]) { cut(ellipsePts(x + dx * CAR.w * s, y - 10 * s, 20 * s, 20 * s, 0, 18), '#3B3430', { key: k + 'w' + dx, sb: 4, sy: 3 }); dot(x + dx * CAR.w * s, y - 10 * s, 6 * s, GR.sand); }
  if (o.label) label(o.label, x, y - (CAR.h + 104) * s, 40 * s, { s: o.labelS ?? 1, rot: (k.length % 3 - 1) * 0.03 });
}

// ---- a day card (calendar page) with its meals, maybe a symptom, maybe a bathroom trip
function dayCard(x, y, w, h, o = {}) {
  const k = o.key ?? 'day', s = o.s ?? 1; if (s <= 0.01) return;
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(s, s); ctx.translate(-w / 2, -h / 2);
  cut(rect(0, 0, w, h, 10), o.fill ?? GR.paper, { key: k, sb: 8, sy: 5, tear: 0.9 });
  cut(rect(0, 0, w, h * 0.16, 8), o.band ?? GR.sand, { key: k + 'band', shadow: false, tear: 0.6, grain: 0.5 });
  if (o.title) serif(o.title, w / 2, h * 0.32, o.titleSize ?? h * 0.11, GR.ink, { key: k + 't' });
  ctx.restore();
}
// ---- a gold link (the true pattern): drawn on from a to b, bulging up
function goldLink(a, b, frac, o = {}) {
  if (frac <= 0) return;
  const mid = [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - (o.lift ?? 46)], P = [];
  for (let i = 0; i <= 24; i++) { const u = i / 24; P.push([(1 - u) ** 2 * a[0] + 2 * (1 - u) * u * mid[0] + u * u * b[0], (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * mid[1] + u * u * b[1]]); }
  ink(P, { w: o.w ?? 7, color: GR.gold, amt: 0.8, key: o.key ?? 'gl', frac });
  dot(a[0], a[1], (o.w ?? 7) * 1.1, GR.gold);
  if (frac >= 1) dot(b[0], b[1], (o.w ?? 7) * 1.1, GR.gold);
}
// ---- a marker circle drawn around something (ink, rough, written on)
function markerCircle(x, y, rx, ry, frac, key) {
  if (frac <= 0) return;
  const P = []; for (let i = 0; i <= 40; i++) { const a = -2.2 + i / 40 * TAU * 1.08; P.push([x + Math.cos(a) * rx * (1 + 0.04 * Math.sin(i)), y + Math.sin(a) * ry]); }
  ink(P, { w: 7, color: GR.ink, amt: 1.6, key, frac, double: true });
}
// ---- a soft spotlight: everything outside the circle dims
function spotlight(x, y, r, a) {
  if (a <= 0.01) return;
  ctx.save(); screen();
  const g = ctx.createRadialGradient(x, y, r * 0.8, x, y, r * 1.35);
  g.addColorStop(0, 'rgba(24,18,14,0)'); g.addColorStop(1, `rgba(24,18,14,${a})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
}

// ---- captions: the voice as word-lit cards on a torn paper strip, at the bottom of the safe box.
//      Cards break at punctuation or 6 words; each word lights on its own start (craft.md: ≤ 7 words, one layer at a time).
const CAP = { size: 50, maxW: 820, y: H - SAFE.bottom - 70 };
const CARDS = (() => {
  const out = [];
  for (const L of VLINES) {
    let cur = [];
    (L.words || []).forEach((w, i, A) => {
      cur.push(w);
      const brk = /[.,;!?]$/.test(w.w) && cur.length >= 2, last = i === A.length - 1;
      if (cur.length >= 6 || brk || last) { out.push({ line: L.id, words: cur }); cur = []; }
    });
  }
  out.forEach((c) => { c.t0 = c.words[0].t0 - 0.08; });
  out.forEach((c, i) => { const nx = out[i + 1]; c.t1 = Math.min(c.words[c.words.length - 1].t1 + 0.6, nx ? nx.t0 - 0.05 : 1e9); });
  return out;
})();
function captionRail() {
  if (typeof CAPTIONS_OFF !== 'undefined' && CAPTIONS_OFF) return;
  const c = CARDS.find((k) => TT >= k.t0 && TT < k.t1); if (!c) return;
  ctx.save(); screen();
  const font = `500 ${CAP.size}px ${HAND}`, sp = fontW(' ', font);
  const ws = c.words.map((w) => ({ ...w, wd: fontW(w.w, font) }));
  const total = ws.reduce((a, w) => a + w.wd, 0) + sp * (ws.length - 1);
  let rows = [ws];
  if (total > CAP.maxW) { let acc = 0, cutAt = 1; for (let i = 0; i < ws.length; i++) { acc += ws[i].wd + sp; if (acc > total / 2) { cutAt = Math.max(1, i); break; } } rows = [ws.slice(0, cutAt + 1), ws.slice(cutAt + 1)].filter((r) => r.length); }
  const rowW = rows.map((r) => r.reduce((a, w) => a + w.wd, 0) + sp * (r.length - 1)), bw = Math.max(...rowW) + 70, lh = CAP.size * 1.28, bh = rows.length * lh + 38;
  const pop = EZ.back(clamp((TT - c.t0) / 0.18)), y0 = CAP.y - bh / 2;
  ctx.translate(CX, CAP.y); ctx.scale(0.94 + 0.06 * pop, 0.94 + 0.06 * pop); ctx.rotate(((c.t0 * 7) % 2 - 1) * 0.012); ctx.translate(-CX, -CAP.y);
  cut(rect(CX - bw / 2, y0, bw, bh, 4), GR.paper, { key: 'cap' + c.t0.toFixed(2), tear: 1.5, sb: 10, sy: 5, grain: 0.5 });
  ctx.font = font; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  rows.forEach((r, ri) => {
    let x = CX - rowW[ri] / 2; const y = y0 + 19 + lh * ri + CAP.size * 0.98;
    for (const w of r) { ctx.fillStyle = TT >= w.t0 ? GR.ink : 'rgba(30,26,23,0.30)'; ctx.fillText(w.w, x, y); x += w.wd + sp; }
  });
  ctx.restore();
}
// the caption rail draws after every frame, outside the camera and the morph windows, then the paper grain
{ const kitPost = STYLE.post; STYLE.post = () => { captionRail(); kitPost(); }; }
const CAPTIONS_OFF = typeof location !== 'undefined' && /[?&]captions=0/.test(location.search);

// ---- the series' lead: a woman (the audience). The kit's bust with shoulder-length hair, a side fringe, small earrings
function woman(x, y, s, o = {}) {
  const hair = o.hair ?? GR.hair, key = o.key ?? 'wm';
  cut([[x - 94 * s, y - 150 * s], [x - 104 * s, y - 70 * s], [x - 100 * s, y + 30 * s], [x - 66 * s, y + 60 * s], [x + 66 * s, y + 60 * s], [x + 100 * s, y + 30 * s], [x + 104 * s, y - 70 * s], [x + 94 * s, y - 150 * s], [x + 62 * s, y - 214 * s], [x - 62 * s, y - 214 * s]], hair, { key: key + 'lh', sb: 6, sy: 4 });
  person(x, y, s, { ...o, hair });
  cut([[x - 84 * s, y - 146 * s], [x - 64 * s, y - 204 * s], [x + 6 * s, y - 220 * s], [x + 72 * s, y - 192 * s], [x + 86 * s, y - 136 * s], [x + 40 * s, y - 172 * s], [x - 30 * s, y - 166 * s]], hair, { key: key + 'fr', sb: 4, sy: 3 });
  dot(x - 77 * s, y - 88 * s, 6 * s, GR.cream); dot(x + 77 * s, y - 88 * s, 6 * s, GR.cream);
}
