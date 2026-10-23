// =====================================================================
//  SCENES v2 — The Caffeine Receipt (RYZE). Next-level motion: one continuous camera (exact time, so it can blur),
//  matched vectors at every cut (zoom-through, inverse zoom, zoom-through, rise), causal moves (print -> feed,
//  stamp -> shake, tear -> fall, drop -> squash), light that changes with time, and something mid-flight every second.
//  Paper still boils on 2s (TT); the camera and things in flight run on the exact time XT().
// =====================================================================
const CU = TIMELINE.cues;
let EXACT_T = null;                                            // set by src/post.js (sub-frame time for motion blur)
const XT = () => (EXACT_T == null ? TT : EXACT_T);
const RC = { x: 170, w: 640, top: 360, lh: 92, size: 38 };     // the receipt strip
const P4 = { i: (u) => clamp(u) ** 4, o: (u) => 1 - (1 - clamp(u)) ** 4 };   // power4 in / out (mirrored at seams)
const seg2 = (t, a, b) => clamp((t - a) / (b - a));
const hexMix = (a, b, u) => { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const x = p(a), y = p(b); return '#' + x.map((v, i) => Math.round(lerp(v, y[i], clamp(u))).toString(16).padStart(2, '0')).join(''); };
const look = (z, p, to = [540, 900]) => camOf({ z, p, to });
function shake(t0, amp, dur = 0.5) { const u = (XT() - t0) / dur; if (u < 0 || u > 1) return [0, 0]; const k = amp * (1 - u) ** 2; return [Math.sin(XT() * 83) * k, Math.cos(XT() * 71) * k]; }

function mono(str, x, y, size, color, o = {}) {
  ctx.save(); ctx.font = `${o.weight ?? 600} ${size}px ${PMONO}`; ctx.fillStyle = color; ctx.textAlign = o.align ?? 'left'; ctx.textBaseline = 'alphabetic';
  const w = ctx.measureText(str).width, frac = clamp(o.frac ?? 1);
  if (frac < 1) { const x0 = o.align === 'right' ? x - w : o.align === 'center' ? x - w / 2 : x; ctx.beginPath(); ctx.rect(x0 - 4, y - size * 1.1, (w + 8) * frac, size * 1.6); ctx.clip(); }
  if (frac > 0) ctx.fillText(str, x, y); ctx.restore(); return w;
}
const pmonoW = (str, size, weight = 600) => fontW(str, `${weight} ${size}px ${PMONO}`);
// a receipt line: time + label on the left, dot leader, amount on the right; prints left to right like a head moving
function rline(y, time, label, amt, t, o = {}) {
  const f = ev(t, 0.35); if (f <= 0) return;
  const col = o.col ?? GR.ink, L = RC.x + 34, R = RC.x + RC.w - 34, left = time ? `${time}  ${label}` : label;
  mono(left, L, y, RC.size, col, { frac: f });
  if (amt) mono(amt, R, y, RC.size, col, { align: 'right', frac: ev(t + 0.15, 0.25) });
  const lw = pmonoW(left, RC.size), aw = amt ? pmonoW(amt, RC.size) : 0;
  ctx.save(); ctx.fillStyle = 'rgba(58,38,32,0.35)'; for (let x = L + lw + 14; x < R - aw - 14; x += 14) if ((x - L) / (R - L) < f) { ctx.beginPath(); ctx.arc(x, y - 8, 2.2, 0, TAU); ctx.fill(); } ctx.restore();
}
function printer(x, y, w, key, busy) {
  const jig = busy ? Math.sin(XT() * 90) * 1.6 : 0;
  cut(rect(x - 40, y - 120 + jig, w + 80, 140, 26), GR.brown, { key: key + 'body', sb: 14, sy: 8, pat: pat.stripes('rgba(255,255,255,0.06)', 10, 40) });
  cut(rect(x - 10, y - 30 + jig, w + 20, 26, 8), '#2B1C16', { key: key + 'slot', shadow: false });
  dot(x + w - 10, y - 80 + jig, 9, busy || B % 10 < 5 ? GR.terra : '#7A5040');
}
function receiptPaper(x, top, w, len, key, fill = GR.paper) {
  const P = [[x, top], [x + w, top]];
  const n = Math.max(6, Math.round(w / 25));
  for (let k = n; k >= 0; k--) P.push([x + w * k / n, top + len + (k % 2 ? 14 : 0)]);
  cut(P, fill, { key: key + 'p', sb: 12, sy: 7, tear: 0.4, grain: 0.5, shade: false });
}
function paperCup(x, y, s, key, light) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  cut([[-34, -46], [34, -46], [26, 46], [-26, 46]], '#FBF7EF', { key: key + 'c', sb: 5, sy: 3 });
  cut([[-31, -12], [31, -12], [28, 18], [-28, 18]], light ? GR.terra : GR.brown, { key: key + 's', shadow: false });
  cut(rect(-40, -60, 80, 18, 6), light ? GR.terra : '#3A2620', { key: key + 'l', sb: 3, sy: 2 });
  ctx.restore();
}
const RLY = (i) => RC.top + 175 + i * RC.lh;                    // line baselines: 0 = 07:00, 1 = 11:00, 2 = 16:00
const YT = RC.top + 175 + 3 * RC.lh + 40;                      // the total line
const T16 = () => [RC.x + 34 + pmonoW('16:', RC.size) + pmonoW('0', RC.size) / 2, RLY(2) - RC.size * 0.36];   // the "0" of 16:00: the zoom-through target

// ---- 1. the receipt prints; the camera rides the print head; the time stamp is the problem
function sReceipt() {
  wall(GR.wall, { key: 'wallR', pat: pat.dots('rgba(83,58,45,0.08)', 3, 44) });
  windowLight({ a: 0.2 });
  const prints = [CU.print, CU.r1, CU.r2, CU.r3, CU.total, CU.fda];
  const busy = prints.some((t) => XT() >= t - 0.05 && XT() < t + 0.45);
  const len = springTrack([[0, 130], [CU.print, 200], [CU.r1, 300], [CU.r2, 395], [CU.r3, 490], [CU.total, 620], [CU.fda, 710]], SPRING.smooth);
  receiptPaper(RC.x, RC.top, RC.w, len, 'rc0');
  printer(RC.x, RC.top, RC.w, 'pr0', busy);
  mono('COFFEE DAY', RC.x + RC.w / 2, RC.top + 80, 44, GR.ink, { align: 'center', frac: ev(CU.print - 0.1, 0.4) });
  mono('— — — — — — — — — — — —', RC.x + RC.w / 2, RC.top + 118, 26, GR.taupe, { align: 'center', frac: ev(CU.print + 0.2, 0.3) });
  [['07:00', CU.r1], ['11:00', CU.r2], ['16:00', CU.r3]].forEach(([tm, t], i) => {
    rline(RLY(i), tm, `CUP ${i + 1}`, '~100MG', t);
    const s = springMove(t + 0.1, 0, 1, SPRING.playful); if (TT >= t + 0.1) paperCup(RC.x + RC.w + 62, RLY(i) - 16 - 40 * (1 - Math.min(1, s)), 0.7 * s, 'cup' + i);
  });
  if (TT >= CU.total - 0.1) mono('- - - - - - - - - - - - - -', RC.x + RC.w / 2, YT - 52, 24, GR.taupe, { align: 'center' });
  rline(YT, '', 'TOTAL', '~300MG', CU.total);
  rline(YT + RC.lh, '', 'FDA, MOST ADULTS', '400/DAY', CU.fda, { col: GR.inkSoft });
  if (TT >= CU.fda + 0.5) { const s = popS(CU.fda + 0.5); ctx.save(); ctx.translate(RC.x + RC.w + 70, YT + RC.lh - 14); ctx.scale(s, s); ink([[-16, 0], [-4, 14], [20, -16]], { w: 8, color: GR.sageD, amt: 0.3, key: 'okT' }); ctx.restore(); }
  // "the amount isn't the problem": a quick underline on the total; "the time stamp is": circle, then the stamp
  if (TT >= CU.amount) ink([[RC.x + RC.w - 200, YT + 14], [lerp(RC.x + RC.w - 200, RC.x + RC.w - 30, ev(CU.amount, 0.3)), YT + 10]], { w: 6, color: GR.sageD, amt: 0.6, key: 'ulT' });
  markerCircle(RC.x + 92, RLY(2) - 12, 100, 50, EZ.o2(ev(CU.stamp - 0.1, 0.45)), 'mc4');
  stamp('6 HRS BEFORE BED', RC.x + RC.w / 2, YT + RC.lh + 100, 46, { s: slam(CU.hit), rot: -0.08 });
  sans('FDA: 400 mg a day for most adults', 500, 1250, 24, GR.inkSoft, { weight: 500 });
}
function camReceipt() {
  const t = XT(), [x16, y16] = T16();
  // camera with intent: follow the print head, settle on the total, whip to 16:00
  const fy = springTrack([[0, 760], [CU.r1, 700], [CU.r2, 740], [CU.r3, 790], [CU.total, YT - 40], [CU.stamp - 0.35, RLY(2)]], SPRING.smooth);
  const fx = springTrack([[0, 500], [CU.total, 520], [CU.stamp - 0.35, 470]], SPRING.smooth);
  const lz = springTrack([[0, Math.log(1.0)], [CU.r1, Math.log(1.06)], [CU.total, Math.log(1.18)], [CU.amount, Math.log(1.3)], [CU.stamp - 0.35, Math.log(1.55)]], { k: 120, d: 18 });
  // the zoom-through: into the "0" of 16:00, accelerating (power4 in), the exit still moving at the cut
  const u = seg2(t, TB.clock - 0.45, TB.clock), z = Math.exp(lz + Math.log(9) * P4.i(u));
  const px = lerp(fx, x16, P4.o(u * 1.25)), py = lerp(fy, y16, P4.o(u * 1.25));
  const [sx, sy] = shake(CU.hit, 14, 0.45);
  return look(z, [px, py], [540 + sx, 900 + sy]);
}

// ---- 2. the clock: 4 p.m. to a 10 p.m. bedtime; the light goes from afternoon to night; sleep gets cut
const CK = { x: 540, y: 820, r: 290 };
const hourAng = (h) => ((h % 12) / 12) * TAU - Math.PI / 2;
function sClock() {
  const sweep = EZ.io(ev(CU.six - 0.1, 1.4)), night = EZ.io(ev(CU.six - 0.1, 2.4));
  wall(hexMix('#F3E6D8', '#3A3F52', night * 0.85), { key: 'wallC', pat: pat.stripes('rgba(255,255,255,0.12)', 26, 86) });
  // the window: the sun sets, the moon rises, stars come out
  const wx = 690, wy = 250, ww = 300, wh = 330;
  cut(rect(wx - 18, wy - 18, ww + 36, wh + 36, 6), GR.woodL, { key: 'winC' });
  cut(rect(wx, wy, ww, wh, 2), hexMix('#F6D3A6', '#25304A', night), { key: 'skyC', shadow: false });
  ctx.save(); ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip();
  cut(ellipsePts(wx + 110, wy + 120 + 260 * night, 46, 46, 0, 24), '#F2B66B', { key: 'sunC', shadow: false });
  if (night > 0.3) { cut(ellipsePts(wx + 210, wy + 300 - 220 * EZ.o2((night - 0.3) / 0.7), 34, 34, 0, 24), '#F3EAD0', { key: 'moonC', shadow: false }); const R = RNG('stC'); for (let i = 0; i < 10; i++) sparkle(wx + R.r(10, ww - 10), wy + R.r(10, wh * 0.6), R.r(3, 6) * clamp((night - 0.5) * 2) * (0.6 + 0.4 * ((B + i) % 2))); }
  ctx.restore();
  cut(rect(wx + ww / 2 - 4, wy, 8, wh, 0), GR.woodL, { key: 'mullC', shadow: false });
  // the clock
  cut(ellipsePts(CK.x, CK.y, CK.r + 30, CK.r + 30, 0, 64), GR.brown, { key: 'ckRim', sb: 16, sy: 9 });
  cut(ellipsePts(CK.x, CK.y, CK.r, CK.r, 0, 64), GR.paper, { key: 'ckFace', shadow: false, grain: 0.5 });
  for (let h = 0; h < 12; h++) { const a = hourAng(h); ink([[CK.x + Math.cos(a) * CK.r * 0.82, CK.y + Math.sin(a) * CK.r * 0.82], [CK.x + Math.cos(a) * CK.r * 0.93, CK.y + Math.sin(a) * CK.r * 0.93]], { w: h % 3 ? 4 : 8, color: GR.ink, amt: 0.3, key: 'tk' + h }); }
  if (sweep > 0) { const a0 = hourAng(4), a1 = a0 + ((hourAng(10) - a0 + TAU) % TAU) * sweep, P = [[CK.x, CK.y]]; for (let i = 0; i <= 40; i++) { const a = lerp(a0, a1, i / 40); P.push([CK.x + Math.cos(a) * CK.r * 0.78, CK.y + Math.sin(a) * CK.r * 0.78]); } cut(P, 'rgba(83,58,45,0.32)', { key: 'wedge', shadow: false, tear: 0.4, grain: 0.4, shade: false }); }
  const hh = 4 + 6 * springMove(CU.six - 0.1, 0, 1, { k: 60, d: 11 }), ah = hourAng(hh);
  ink([[CK.x, CK.y], [CK.x + Math.cos(ah) * CK.r * 0.55, CK.y + Math.sin(ah) * CK.r * 0.55]], { w: 14, color: GR.ink, amt: 0.4, key: 'hand' });
  const am = hourAng(hh * 12);   // the minute hand spins with the hours
  ink([[CK.x, CK.y], [CK.x + Math.cos(am) * CK.r * 0.75, CK.y + Math.sin(am) * CK.r * 0.75]], { w: 7, color: GR.ink, amt: 0.4, key: 'minute' });
  dot(CK.x, CK.y, 14, GR.ink);
  label('4 PM', CK.x + Math.cos(hourAng(4)) * (CK.r + 100), CK.y + Math.sin(hourAng(4)) * (CK.r + 70), 48, { s: popS(CU.four - 0.1), rot: 0.04 });
  const bed = popS(CU.bed - 0.1); if (bed > 0) label('10 PM · bed', CK.x + Math.cos(hourAng(10)) * (CK.r + 60), CK.y + Math.sin(hourAng(10)) * (CK.r + 60) - 70, 46, { s: bed, rot: -0.04 });
  if (sweep > 0.98) serif('6 hours', CK.x, CK.y + 130, 72, GR.ink, { key: 'sixH', frac: ev(CU.six + 1.3, 0.4) });
  // the study: sleep is a line, and it snaps
  const st = ev(CU.study - 0.1, 0.5);
  if (st > 0) {
    const y = 1240, x0 = 170, x1 = 870, snap = XT() >= CU.cut;
    const col = night > 0.5 ? '#E9E3F0' : GR.duskD;
    serif('sleep', x0, y - 34, 50, col, { align: 'left', key: 'slpL', frac: st });
    if (!snap) ink([[x0, y], [lerp(x0, x1, st), y]], { w: 10, color: col, amt: 0.5, key: 'sleep0' });
    else { const k = P4.o(seg2(XT(), CU.cut, CU.cut + 0.6)); ink([[x0, y], [600 - 30 * k, y + 40 * k * k]], { w: 10, color: col, amt: 0.5, key: 'sleepA' }); ink([[640 + 30 * k, y - 40 * k * k], [x1, y]], { w: 10, color: col, amt: 0.5, key: 'sleepB' }); }
    sans('Drake et al., J Clin Sleep Med 2013', 520, y + 64, 24, night > 0.5 ? '#CFC8D8' : GR.inkSoft, { weight: 500 });
  }
}
function camClock() {
  const t = XT();
  const zin = lerp(0.8, 1, P4.o(seg2(t, TB.clock, TB.clock + 0.55)));             // entry: still pushing forward (Z +)
  const drift = Math.exp(Math.log(1.1) * EZ.io(seg2(t, CU.six, VL('study').t1)));  // a slow push through the six hours
  const zout = Math.exp(Math.log(0.55) * P4.i(seg2(t, TB.again - 0.45, TB.again))); // exit: inverse zoom (Z -), arrival next
  const [sx, sy] = shake(CU.cut, 8, 0.4);
  return look(zin * drift * zout, [CK.x, CK.y], [540 + sx, 900 + sy]);
}

// ---- 3. the receipt prints again: faster and faster, onto a growing pile
const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI'];
const DROPS = (() => { const out = []; let t = 0, gap = 0.55; for (let k = 0; k < 12; k++) { out.push(t); t += gap; gap = Math.max(0.13, gap * 0.78); } return out; })();
const PILE = { x: 540, y: 1150 };
function miniReceipt(x, y, rot, day, key, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  cut(rect(-150, -220, 300, 440, 4), GR.paper, { key, sb: 12, sy: 7, grain: 0.4 });
  mono(day, 0, -160, 34, GR.ink, { align: 'center' });
  ['07:00 CUP', '11:00 CUP', '16:00 CUP'].forEach((s2, i) => mono(s2, -118, -80 + i * 62, 26, GR.ink));
  ink(ellipsePts(-68, 36, 70, 30, 0, 30), { w: 5, color: GR.ink, amt: 1.4, key: key + 'c', closed: true });
  ctx.restore();
}
function sAgain() {
  wall(GR.wall, { key: 'wallA', pat: pat.dots('rgba(83,58,45,0.08)', 3, 44) });
  windowLight({ a: 0.2 });
  const t0 = TB.again + 0.1, span = CU.prints + 0.6 - t0, scaleT = span / (DROPS[DROPS.length - 1] + 0.3);
  const busy = DROPS.some((d) => { const td = t0 + d * scaleT; return XT() >= td - 0.1 && XT() < td + 0.25; });
  DROPS.forEach((d, k) => {
    const td = t0 + d * scaleT; if (XT() < td) return;
    const R = RNG('drop', k), fall = P4.i(seg2(XT(), td, td + 0.32));
    const restY = PILE.y - k * 9, rot = R.n(0.16), x = PILE.x + R.n(40);
    const y = fall < 1 ? lerp(330, restY, fall) : restY, rr = lerp(0, rot, fall);
    const sq = fall >= 1 ? 1 - 0.06 * Math.exp(-(XT() - td - 0.32) * 18) : 1;   // a little squash when it lands
    ctx.save(); ctx.translate(x, y); ctx.scale(1 / sq, sq); miniReceipt(0, 0, rr, DAYS[k], 'mr' + k, 0.92); ctx.restore();
  });
  printer(PILE.x - 200, 250, 400, 'pr2', busy);
}
function camAgain() {
  const t = XT();
  const zin = Math.exp(Math.log(1.35) * (1 - P4.o(seg2(t, TB.again, TB.again + 0.55))));  // entry: still pulling back (Z -)
  const pull = Math.exp(Math.log(0.9) * EZ.io(seg2(t, TB.again + 0.5, CU.prints + 0.6)));
  const top = PILE.y - (DROPS.length - 1) * 9;
  const zt = Math.exp(Math.log(5) * P4.i(seg2(t, TB.fix - 0.45, TB.fix)));             // exit: zoom-through into the top receipt (Z +)
  const py = lerp(760, top, P4.o(seg2(t, TB.fix - 0.6, TB.fix - 0.1)));
  return look(zin * pull * zt, [PILE.x, py], [540, 900]);
}

// ---- 4. lighten the late cup: the 16:00 strip tears off, a fresh one prints RYZE; the total rolls; the pouch lands
function rollNum(x, y, from, to, u, size, col) {   // an odometer: each digit column scrolls to its new value
  const a = String(from).padStart(3, '0'), b = String(to).padStart(3, '0'), cw = pmonoW('0', size);
  for (let i = 0; i < 3; i++) {
    const da = +a[i], db = +b[i], v = lerp(da, db + (db < da ? 10 : 0), u), base = Math.floor(v), f = v - base;
    ctx.save(); ctx.beginPath(); ctx.rect(x + i * cw - 2, y - size, cw + 4, size * 1.3); ctx.clip();
    mono(String(base % 10), x + i * cw, y - f * size * 1.1, size, col); mono(String((base + 1) % 10), x + i * cw, y + (1 - f) * size * 1.1, size, col);
    ctx.restore();
  }
}
function sFix() {
  wall(GR.cream, { key: 'wallF', pat: pat.dots('rgba(83,58,45,0.07)', 3, 44) });
  windowLight({ a: 0.18 });
  const torn = XT() >= CU.lighten, fresh = springMove(CU.fortyeight - 0.45, 0, 1, { k: 150, d: 16 });
  ctx.save(); ctx.translate(-96, 70); ctx.scale(0.8, 0.8);
  // the receipt, with a gap where the 16:00 strip was
  const gapY0 = RLY(2) - RC.lh * 0.62, gapY1 = RLY(2) + RC.lh * 0.38;
  receiptPaper(RC.x, RC.top, RC.w, 760, 'rc2');
  if (torn) { cut([[RC.x - 2, gapY0], ...Array.from({ length: 27 }, (_, k) => [RC.x + RC.w * k / 26, gapY0 + (k % 2 ? 10 : 0)]), [RC.x + RC.w + 2, gapY0], [RC.x + RC.w + 2, gapY1], ...Array.from({ length: 27 }, (_, k) => [RC.x + RC.w * (26 - k) / 26, gapY1 - (k % 2 ? 10 : 0)])], GR.cream, { key: 'gap', shadow: false, tear: 0.6, grain: 0.4 }); }
  printer(RC.x, RC.top, RC.w, 'pr3', XT() >= CU.fortyeight - 0.5 && XT() < CU.fortyeight + 0.5);
  mono('COFFEE DAY', RC.x + RC.w / 2, RC.top + 80, 44, GR.ink, { align: 'center' });
  [0, 1].forEach((i) => rline(RLY(i), ['07:00', '11:00'][i], `CUP ${i + 1}`, '~100MG', TB.fix - 1));
  // the old 16:00 strip: on its own paper; on "lighten" it rips free and falls, spinning (gravity on the exact time)
  const ft = Math.max(0, XT() - CU.lighten);
  ctx.save(); ctx.translate(0, 900 * ft * ft + 120 * ft); ctx.translate(RC.x + RC.w / 2, RLY(2) - 20); ctx.rotate(torn ? 1.6 * ft * ft + 0.4 * ft : 0); ctx.translate(-(RC.x + RC.w / 2), -(RLY(2) - 20));
  if (!torn || ft < 1.6) { cut(rect(RC.x, gapY0, RC.w, gapY1 - gapY0, 2), GR.paper, { key: 'oldStrip', shadow: torn, sb: 14, sy: 10, tear: 1.2, grain: 0.4 }); rline(RLY(2), '16:00', 'CUP 3', '~100MG', TB.fix - 1); }
  ctx.restore();
  // the fresh strip slides in from the left and prints RYZE in terracotta
  if (XT() >= CU.fortyeight - 0.45) {
    ctx.save(); ctx.translate(lerp(-RC.w - 200, 0, fresh), 0);
    cut(rect(RC.x, gapY0 + 6, RC.w, gapY1 - gapY0 - 12, 2), '#FFF8F1', { key: 'newStrip', sb: 8, sy: 5, tear: 0.6, grain: 0.4 });
    rline(RLY(2), '16:00', 'RYZE', '~48MG', CU.fortyeight, { col: GR.terra });
    ctx.restore();
  }
  mono('- - - - - - - - - - - - - -', RC.x + RC.w / 2, RLY(3) + 40 - 52, 24, GR.taupe, { align: 'center' });
  const u = P4.o(seg2(XT(), CU.fortyeight + 0.2, CU.fortyeight + 1.0)), done = u > 0.99;
  rline(RLY(3) + 40, '', 'TOTAL', '', TB.fix - 1, { col: done ? GR.terra : GR.ink });
  const tsz = RC.size, R = RC.x + RC.w - 34, numW = pmonoW('000MG', tsz);
  mono('~', R - numW - pmonoW('~', tsz), RLY(3) + 40, tsz, done ? GR.terra : GR.ink);
  rollNum(R - numW, RLY(3) + 40, 300, 248, u, tsz, done ? GR.terra : GR.ink);
  mono('MG', R, RLY(3) + 40, tsz, done ? GR.terra : GR.ink, { align: 'right' });
  ctx.restore();
  // the pouch drops in and lands with a squash, its shadow growing under it
  if (XT() >= CU.ryze - 0.35) {
    const fall = P4.i(seg2(XT(), CU.ryze - 0.35, CU.ryze)), land = XT() - CU.ryze;
    const y = lerp(-300, 880, fall), sq = land > 0 ? 1 - 0.12 * Math.exp(-land * 9) * Math.cos(land * 26) : 1;
    ctx.save(); ctx.fillStyle = `rgba(60,40,25,${0.22 * fall})`; ctx.beginPath(); ctx.ellipse(800, 1090, 120 * fall, 18 * fall, 0, 0, TAU); ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(800, y + 195); ctx.scale(2 - sq, sq); ctx.translate(0, -195); ctx.rotate(0.04 * (1 - fall) + 0.03);
    cut(rect(-130, -195, 260, 390, 6), GR.paper, { key: 'pkFrame', sb: 14, sy: 8 }); drawAsset('pouch.png', -116, -181, 232, 354, { fit: 'cover', r: 4 });
    ctx.restore();
  }
  const mu = popS(CU.mush - 0.1); if (mu > 0) label('6 functional mushrooms', 760, 1170, 40, { s: mu, rot: -0.03 });
  for (let i = 0; i < 3 && XT() > CU.ryze; i++) { const P = []; for (let k = 0; k <= 8; k++) P.push([760 + i * 40 + Math.sin(k * 0.9 + i + XT() * 3) * 9, 660 - k * 12 - (XT() * 40 % 30)]); ink(P, { w: 4, color: 'rgba(255,255,255,0.8)', amt: 0.6, key: 'steam' + i }); }
  sans('Caffeine per RYZE (Medium Roast): about 48 mg per cup', 520, 1268, 22, GR.inkSoft, { weight: 500 });
}
function camFix() {
  const t = XT();
  const zin = lerp(0.85, 1, P4.o(seg2(t, TB.fix, TB.fix + 0.55)));                      // entry: still pushing (Z +)
  const fx = springTrack([[0, 380], [CU.ryze - 0.2, 560]], SPRING.smooth);                  // reframe to include the pouch
  const rise = -620 * P4.i(seg2(t, TB.end - 0.45, TB.end));                                  // exit: everything rises (UP = conclusion)
  const [sx, sy] = shake(CU.ryze, 10, 0.35);
  return look(zin, [fx, 840 - rise], [540 + sx, 900 + sy]);
}

// ---- 5. end card: same ritual, lighter receipt; the button is pressed
function sEnd() {
  wall(GR.cream, { key: 'wallE', pat: pat.dots('rgba(83,58,45,0.07)', 3, 44) });
  windowLight({ a: 0.16, vig: 0.1 });
  drawAsset('ryze-logo.svg', 540 - 200, 380, 400, 84, { fit: 'contain' });
  ctx.save(); ctx.translate(540, 760); ctx.rotate(-0.02); cut(rect(-170, -255, 340, 510, 6), GR.paper, { key: 'endFrame', sb: 16, sy: 9 }); drawAsset('pouch.png', -154, -239, 308, 470, { fit: 'cover', r: 4 }); ctx.restore();
  serif('Same ritual. Lighter receipt.', 540, 1130, 66, GR.ink, { key: 'tagE', frac: EZ.o2(ev(CU.close - 0.1, 0.9)) });
  const t0 = VL('close').t1 + 0.3, cb = popS(t0), press = XT() - (t0 + 0.8);
  if (cb > 0) {
    const ps = press > 0 ? 1 - 0.06 * Math.exp(-press * 10) * Math.sin(Math.min(Math.PI, press * 18)) : 1;
    ctx.save(); ctx.translate(540, 1265); ctx.scale(cb * ps, cb * ps); cut(rect(-300, -60, 600, 120, 60), GR.terra, { key: 'ctaBtn', sb: 12, sy: 6 }); sans('Try RYZE Mushroom Coffee', 0, 14, 42, GR.cream, { weight: 700 }); ctx.restore();
    if (press > 0 && press < 0.9) { const r = 60 + 420 * P4.o(press / 0.9); ctx.save(); ctx.strokeStyle = `rgba(202,88,57,${0.5 * (1 - press / 0.9)})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(540, 1265, r * 1.6, r * 0.5, 0, 0, TAU); ctx.stroke(); ctx.restore(); }
  }
}
function camEnd() {
  const t = XT(), rise = 620 * (1 - P4.o(seg2(t, TB.end, TB.end + 0.55)));               // entry: still rising (UP)
  const settle = Math.exp(Math.log(1.04) * EZ.io(seg2(t, TB.end + 0.5, TIMELINE.duration)));
  return look(settle, [540, 900 - rise], [540, 900]);
}
