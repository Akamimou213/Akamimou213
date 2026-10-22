// =====================================================================
//  SCENES — The Caffeine Receipt (RYZE). One function per era, world coords 1080x1920, cued from the voice.
// =====================================================================
const CU = TIMELINE.cues;
const RC = { x: 170, w: 640, top: 360, lh: 92, size: 38 };   // the receipt strip

function mono(str, x, y, size, color, o = {}) {
  ctx.save(); ctx.font = `${o.weight ?? 600} ${size}px ${PMONO}`; ctx.fillStyle = color; ctx.textAlign = o.align ?? 'left'; ctx.textBaseline = 'alphabetic';
  const w = ctx.measureText(str).width, frac = clamp(o.frac ?? 1);
  if (frac < 1) { const x0 = o.align === 'right' ? x - w : o.align === 'center' ? x - w / 2 : x; ctx.beginPath(); ctx.rect(x0 - 4, y - size * 1.1, (w + 8) * frac, size * 1.6); ctx.clip(); }
  if (frac > 0) ctx.fillText(str, x, y); ctx.restore(); return w;
}
// a receipt line: time on the left, label, dot leader, amount on the right; prints left to right
function rline(y, time, label, amt, t, o = {}) {
  const f = ev(t, 0.35); if (f <= 0) return;
  const col = o.col ?? GR.ink, L = RC.x + 34, R = RC.x + RC.w - 34;
  const left = time ? `${time}  ${label}` : label;
  mono(left, L, y, RC.size, col, { frac: f });
  mono(amt, R, y, RC.size, col, { align: 'right', frac: ev(t + 0.15, 0.25) });
  const lw = fontW(left, `600 ${RC.size}px ${PMONO}`), aw = fontW(amt, `600 ${RC.size}px ${PMONO}`);
  ctx.save(); ctx.fillStyle = 'rgba(58,38,32,0.35)'; for (let x = L + lw + 14; x < R - aw - 14; x += 14) if ((x - L) / (R - L) < f) { ctx.beginPath(); ctx.arc(x, y - 8, 2.2, 0, TAU); ctx.fill(); } ctx.restore();
  if (o.strike) { const s = ev(o.strike, 0.35); if (s > 0) ink([[L - 6, y - 10], [lerp(L - 6, R + 6, s), y - 12]], { w: 6, color: GR.ink, amt: 0.6, key: 'strk' + y }); }
}
// the printer and its paper: the strip slides down as lines print
function printer(x, y, key) {
  cut(rect(x - 40, y - 120, RC.w + 80, 140, 26), GR.brown, { key: key + 'body', sb: 14, sy: 8, pat: pat.stripes('rgba(255,255,255,0.06)', 10, 40) });
  cut(rect(x - 10, y - 30, RC.w + 20, 26, 8), '#2B1C16', { key: key + 'slot', shadow: false });
  dot(x + RC.w - 10, y - 80, 9, B % 10 < 5 ? GR.terra : '#7A5040');
}
function receiptPaper(x, top, len, key) {   // the strip with a torn zigzag bottom
  const P = [[x, top], [x + RC.w, top]];
  for (let k = 26; k >= 0; k--) P.push([x + RC.w * k / 26, top + len + (k % 2 ? 14 : 0)]);
  cut(P, GR.paper, { key: key + 'p', sb: 12, sy: 7, tear: 0.4, grain: 0.5, shade: false });
}
function paperCup(x, y, s, key, light) {   // a takeaway cup: sleeve brown, or terracotta for the lighter cup
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  cut([[-34, -46], [34, -46], [26, 46], [-26, 46]], '#FBF7EF', { key: key + 'c', sb: 5, sy: 3 });
  cut([[-31, -12], [31, -12], [28, 18], [-28, 18]], light ? GR.terra : GR.brown, { key: key + 's', shadow: false });
  cut(rect(-40, -60, 80, 18, 6), light ? GR.terra : '#3A2620', { key: key + 'l', sb: 3, sy: 2 });
  ctx.restore();
}
const LINES = () => [
  { y: RC.top + 175, time: '07:00', label: 'CUP 1', amt: '~100MG', t: CU.r1 },
  { y: RC.top + 175 + RC.lh, time: '11:00', label: 'CUP 2', amt: '~100MG', t: CU.r2 },
  { y: RC.top + 175 + 2 * RC.lh, time: '16:00', label: 'CUP 3', amt: '~100MG', t: CU.r3 },
];

// ---- 1. the receipt: a normal coffee day; the total is fine; the time stamp isn't
function sReceipt() {
  wall(GR.wall, { key: 'wallR', pat: pat.dots('rgba(83,58,45,0.08)', 3, 44) });
  windowLight({ a: 0.2 });
  const L = LINES(), nPrinted = [CU.r1, CU.r2, CU.r3, CU.total, CU.fda].filter((t) => TT >= t - 0.1).length;
  const len = springTrack([[0, 130], [CU.print, 200], [CU.r1, 300], [CU.r2, 395], [CU.r3, 490], [CU.total, 620], [CU.fda, 710]], SPRING.smooth);
  receiptPaper(RC.x, RC.top, len, 'rc0');
  printer(RC.x, RC.top, 'pr0');
  mono('COFFEE DAY', RC.x + RC.w / 2, RC.top + 80, 44, GR.ink, { align: 'center', weight: 600, frac: ev(CU.print - 0.1, 0.4) });
  mono('— — — — — — — — — — — —', RC.x + RC.w / 2, RC.top + 118, 26, GR.taupe, { align: 'center', frac: ev(CU.print + 0.2, 0.3) });
  L.forEach((l, i) => { rline(l.y, l.time, l.label, l.amt, l.t); const s = popS(l.t + 0.1); if (s > 0) paperCup(RC.x + RC.w + 62, l.y - 16, 0.7 * s, 'cup' + i); });
  const yT = RC.top + 175 + 3 * RC.lh + 40;
  if (TT >= CU.total - 0.1) mono('- - - - - - - - - - - - - -', RC.x + RC.w / 2, yT - 52, 24, GR.taupe, { align: 'center' });
  rline(yT, '', 'TOTAL', '~300MG', CU.total);
  rline(yT + RC.lh, '', 'FDA, MOST ADULTS', '400/DAY', CU.fda, { col: GR.inkSoft });
  if (TT >= CU.fda + 0.5) { const s = popS(CU.fda + 0.5); ctx.save(); ctx.translate(RC.x + RC.w + 70, yT + RC.lh - 14); ctx.scale(s, s); ink([[-16, 0], [-4, 14], [20, -16]], { w: 8, color: GR.sageD, amt: 0.3, key: 'okT' }); ctx.restore(); }
  // the turn: the amount gets a quick tick; the 4 p.m. time stamp gets circled, then STAMPED
  markerCircle(RC.x + 92, L[2].y - 12, 100, 50, EZ.o2(ev(CU.stamp - 0.1, 0.45)), 'mc4');
  stamp('6 HRS BEFORE BED', RC.x + RC.w / 2, yT + RC.lh + 100, 46, { s: slam(CU.hit), rot: -0.08 });
  sans('FDA: 400 mg a day for most adults', 500, 1250, 24, GR.inkSoft, { weight: 500 });
}

// ---- 2. the clock: 4 p.m. to a 10 p.m. bedtime is six hours; sleep gets cut
const CK = { x: 500, y: 800, r: 300 };
const hourAng = (h) => ((h % 12) / 12) * TAU - Math.PI / 2;
function sClock() {
  wall(GR.wall2, { key: 'wallC', pat: pat.stripes('rgba(255,255,255,0.22)', 26, 86) });
  windowLight({ a: 0.18 });
  cut(ellipsePts(CK.x, CK.y, CK.r + 30, CK.r + 30, 0, 64), GR.brown, { key: 'ckRim', sb: 16, sy: 9 });
  cut(ellipsePts(CK.x, CK.y, CK.r, CK.r, 0, 64), GR.paper, { key: 'ckFace', shadow: false, grain: 0.5 });
  for (let h = 0; h < 12; h++) { const a = hourAng(h); ink([[CK.x + Math.cos(a) * CK.r * 0.82, CK.y + Math.sin(a) * CK.r * 0.82], [CK.x + Math.cos(a) * CK.r * 0.93, CK.y + Math.sin(a) * CK.r * 0.93]], { w: h % 3 ? 4 : 8, color: GR.ink, amt: 0.3, key: 'tk' + h }); }
  // the six-hour wedge from 4 to 10, swept on "six"
  const sweep = EZ.io(ev(CU.six - 0.1, 1.0));
  if (sweep > 0) { const a0 = hourAng(4), a1 = a0 + (hourAng(10) - a0 + TAU) % TAU * sweep, P = [[CK.x, CK.y]]; for (let i = 0; i <= 40; i++) { const a = lerp(a0, a1, i / 40); P.push([CK.x + Math.cos(a) * CK.r * 0.78, CK.y + Math.sin(a) * CK.r * 0.78]); } cut(P, 'rgba(83,58,45,0.32)', { key: 'wedge', shadow: false, tear: 0.4, grain: 0.4, shade: false }); }
  const hh = 4 + 6 * sweep, ah = hourAng(hh);
  ink([[CK.x, CK.y], [CK.x + Math.cos(ah) * CK.r * 0.55, CK.y + Math.sin(ah) * CK.r * 0.55]], { w: 14, color: GR.ink, amt: 0.4, key: 'hand' });
  dot(CK.x, CK.y, 14, GR.ink);
  label('4 PM', CK.x + Math.cos(hourAng(4)) * (CK.r + 110), CK.y + Math.sin(hourAng(4)) * (CK.r + 60), 48, { s: popS(CU.four - 0.1), rot: 0.04 });
  const bed = popS(CU.bed - 0.1);
  if (bed > 0) { const bx = CK.x + Math.cos(hourAng(10)) * (CK.r + 40), by = CK.y + Math.sin(hourAng(10)) * (CK.r + 40) - 80; label('10 PM · bed', bx + 60, by - 40, 46, { s: bed, rot: -0.04 }); }
  if (sweep > 0.98) serif('6 hours', CK.x, CK.y + 120, 72, GR.ink, { key: 'sixH', frac: ev(CU.six + 0.9, 0.4) });
  // the study: sleep as a line that breaks
  const st = ev(CU.study - 0.1, 0.4);
  if (st > 0) {
    const y = 1230, x0 = 160, x1 = 860, cutAt = ev(CU.cut, 0.3);
    ink([[x0, y], [lerp(x0, x1, st * 0.6), y]], { w: 10, color: GR.duskD, amt: 0.5, key: 'sleep1' });
    if (cutAt > 0) { ink([[620, y - 20], [650, y + 20], [680, y - 20]], { w: 6, color: GR.red, amt: 0.4, key: 'zig', frac: cutAt }); ink([[700, y], [lerp(700, x1, cutAt), y]], { w: 10, color: GR.duskD, amt: 0.5, key: 'sleep2' }); }
    serif('sleep', x0, y - 30, 48, GR.duskD, { align: 'left', key: 'slpL', frac: st });
    sans('Drake et al., J Clin Sleep Med 2013', 510, y + 64, 24, GR.inkSoft, { weight: 500 });
  }
}

// ---- 3. less sleep, more coffee: the receipt prints again
function miniReceipt(x, y, rot, day, k, key) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k);
  cut(rect(-150, -230, 300, 460, 4), GR.paper, { key: key, sb: 12, sy: 7, grain: 0.4 });
  mono(day, 0, -170, 34, GR.ink, { align: 'center' });
  ['07:00 CUP', '11:00 CUP', '16:00 CUP'].forEach((s, i) => mono(s, -120, -90 + i * 62, 26, GR.ink));
  ellipsePts && ink(ellipsePts(-70, 34, 70, 30, 0, 30), { w: 5, color: GR.ink, amt: 1.4, key: key + 'c', closed: true });
  ctx.restore();
}
function sAgain() {
  wall(GR.wall, { key: 'wallA', pat: pat.dots('rgba(83,58,45,0.08)', 3, 44) });
  windowLight({ a: 0.2 });
  const t0 = TB.again;
  miniReceipt(230, 800, -0.08, 'MON', popS(t0 + 0.1), 'mrA');
  miniReceipt(500, 760, 0.02, 'TUE', popS(CU.less + 0.6), 'mrB');
  miniReceipt(770, 800, 0.09, 'WED', popS(CU.prints - 0.1), 'mrC');
  const lp = ev(CU.prints, 0.6);
  if (lp > 0) { const P = []; for (let i = 0; i <= 40; i++) { const a = Math.PI * 0.95 - i / 40 * Math.PI * 0.9; P.push([500 + Math.cos(a) * 380, 1130 + Math.sin(a) * 90]); } ink(P, { w: 7, color: GR.ink, amt: 1, key: 'loopA', frac: lp }); }
}

// ---- 4. lighten the late cup: RYZE, about 48 mg
function sFix() {
  wall(GR.cream, { key: 'wallF', pat: pat.dots('rgba(83,58,45,0.07)', 3, 44) });
  windowLight({ a: 0.18 });
  const L = LINES();
  ctx.save(); ctx.translate(-96, 70); ctx.scale(0.8, 0.8);
  receiptPaper(RC.x, RC.top, 760, 'rc2');
  printer(RC.x, RC.top, 'pr2');
  mono('COFFEE DAY', RC.x + RC.w / 2, RC.top + 80, 44, GR.ink, { align: 'center' });
  L.forEach((l, i) => rline(l.y, l.time, l.label, l.amt, TB.fix - 1, i === 2 ? { strike: CU.lighten } : {}));
  rline(L[2].y + RC.lh, '16:00', 'RYZE', '~48MG', CU.fortyeight - 0.3, { col: GR.terra });
  const yT = RC.top + 175 + 4 * RC.lh + 40;
  mono('- - - - - - - - - - - - - -', RC.x + RC.w / 2, yT - 52, 24, GR.taupe, { align: 'center' });
  const tot = TT < CU.fortyeight ? '~300MG' : '~248MG';
  rline(yT, '', 'TOTAL', tot, TB.fix - 1, { col: TT < CU.fortyeight ? GR.ink : GR.terra });
  ctx.restore();
  // the real product, framed on the page
  const pk = popS(CU.ryze - 0.1);
  if (pk > 0) { ctx.save(); ctx.translate(800, 880); ctx.rotate(0.04); ctx.scale(pk, pk); cut(rect(-130, -195, 260, 390, 6), GR.paper, { key: 'pkFrame', sb: 14, sy: 8 }); drawAsset('pouch.png', -116, -181, 232, 354, { fit: 'cover', r: 4 }); ctx.restore(); }
  const mu = popS(CU.mush - 0.1);
  if (mu > 0) label('6 functional mushrooms', 760, 1150, 40, { s: mu, rot: -0.03 });
  sans('Caffeine per RYZE (Medium Roast): about 48 mg per cup', 520, 1268, 22, GR.inkSoft, { weight: 500 });
}

// ---- 5. end card: same ritual, lighter receipt
function sEnd() {
  wall(GR.cream, { key: 'wallE', pat: pat.dots('rgba(83,58,45,0.07)', 3, 44) });
  windowLight({ a: 0.16, vig: 0.1 });
  drawAsset('ryze-logo.svg', 540 - 200, 380, 400, 84, { fit: 'contain' });
  ctx.save(); ctx.translate(540, 760); ctx.rotate(-0.02); cut(rect(-170, -255, 340, 510, 6), GR.paper, { key: 'endFrame', sb: 16, sy: 9 }); drawAsset('pouch.png', -154, -239, 308, 470, { fit: 'cover', r: 4 }); ctx.restore();
  serif('Same ritual. Lighter receipt.', 540, 1130, 66, GR.ink, { key: 'tagE', frac: EZ.o2(ev(CU.close - 0.1, 0.9)) });
  const cb = popS(VL('close').t1 + 0.3);
  if (cb > 0) { ctx.save(); ctx.translate(540, 1265); ctx.scale(cb, cb); cut(rect(-300, -60, 600, 120, 60), GR.terra, { key: 'ctaBtn', sb: 12, sy: 6 }); sans('Try RYZE Mushroom Coffee', 0, 14, 42, GR.cream, { weight: 700 }); ctx.restore(); }
}
