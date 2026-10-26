// =====================================================================
//  SCENES — Level Up. One function per era, world coords 1080x1920, cued from the voice. Graph-paper game grammar
//  in the series' cut-paper palette.
// =====================================================================
const CU = TIMELINE.cues;
const MAYA = { skin: '#C98E6B', hair: '#2A211C', shirt: GR.dusk };
// ---- Maya: busts cut from the character sheet (ChatGPT), one per expression; head anchored (hair top, hair centre) so a
//      change of expression doesn't jump. Each change pops (a quick squash) — the face reacts to the line, not on a loop.
const MAYA_SPR = { smile: ['mayaA.png', 148], worried: ['mayaB.png', 144], unsure: ['mayaC.png', 137], down: ['mayaD.png', 175], content: ['mayaE.png', 157], happy: ['mayaF.png', 152] };
function maya(x, y, s, moods) {   // moods: [[t, mood], ...] sorted; (x, y, s) as woman(): hair top at y - 200s, desk hides the cut
  let cur = moods[0], k = 0; moods.forEach((m, i) => { if (TT >= m[0]) { cur = m; k = i; } });
  const [file, cx] = MAYA_SPR[cur[1]], img = asset(file); if (!img) return;
  const pop = k > 0 ? 1 + 0.05 * Math.sin(Math.PI * clamp((TT - cur[0]) / 0.22)) * (1 - clamp((TT - cur[0]) / 0.22)) : 1;
  const sq = k > 0 ? 1 - 0.035 * Math.sin(Math.PI * clamp((TT - cur[0]) / 0.18)) : 1;
  const z = 1.05 * s, top = y - 200 * s;
  ctx.save(); ctx.translate(x, top + img.height * z); ctx.scale(pop / sq, sq * pop); ctx.translate(-x, -(top + img.height * z));
  ctx.shadowColor = 'rgba(60,40,20,0.28)'; ctx.shadowBlur = 14 * s; ctx.shadowOffsetY = 6 * s;
  ctx.drawImage(img, x - cx * z, top - 2 * z, img.width * z, img.height * z); ctx.restore();
}
function mayaBody(x, feetY, h, rot = 0, o = {}) {   // the full figure (front), feet at (x, feetY), h tall
  const img = asset('mayaBody.png'); if (!img) return;
  const z = h / img.height;
  ctx.save(); ctx.translate(x, feetY); ctx.rotate(rot); if (o.sx) ctx.scale(o.sx, o.sy ?? 1);
  ctx.shadowColor = 'rgba(60,40,20,0.3)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 8;
  ctx.drawImage(img, -102 * z, -img.height * z, img.width * z, img.height * z); ctx.restore();
}


function gridPaper(c = '#F2EEE6', key = 'grid') {
  wall(c, { key, pat: (bb) => { ctx.strokeStyle = 'rgba(120,140,160,0.16)'; ctx.lineWidth = 2; ctx.beginPath(); for (let x = bb.x0; x < bb.x1; x += 48) { ctx.moveTo(x, bb.y0); ctx.lineTo(x, bb.y1); } for (let y = bb.y0; y < bb.y1; y += 48) { ctx.moveTo(bb.x0, y); ctx.lineTo(bb.x1, y); } ctx.stroke(); } });
}
// a game tag: dark paper plate, cream caps with tracking, stepped "pixel" corners
function gameTag(str, x, y, size, o = {}) {
  const s = o.s ?? 1; if (s <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? 0); ctx.scale(s, s);
  const w = fontW(str, `700 ${size}px ${HAND}`) + str.length * size * 0.1 + size * 1.1, h = size * 1.6, st = size * 0.18;
  const P = [[-w / 2 + st, -h / 2], [w / 2 - st, -h / 2], [w / 2 - st, -h / 2 + st], [w / 2, -h / 2 + st], [w / 2, h / 2 - st], [w / 2 - st, h / 2 - st], [w / 2 - st, h / 2], [-w / 2 + st, h / 2], [-w / 2 + st, h / 2 - st], [-w / 2, h / 2 - st], [-w / 2, -h / 2 + st], [-w / 2 + st, -h / 2 + st]];
  cut(P, o.fill ?? GR.ink, { key: 'gt' + str, tear: 0.4, amt: 0.3, sb: 8, sy: 5, grain: 0.4 });
  sans(str, 0, size * 0.36, size, o.color ?? GR.butter, { weight: 700, ls: `${size * 0.1}px` });
  ctx.restore();
}
function bubble(str, x, y, size, o = {}) {   // a paper speech bubble with a tail toward (tx, ty)
  const s = o.s ?? 1; if (s <= 0.01) return;
  const w = fontW(str, `italic 400 ${size}px ${SERIF}`) + size * 0.9, h = size * 1.5;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  cut([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [(o.tail ?? 1) * w * 0.25 + 18, h / 2], [(o.tail ?? 1) * w * 0.32, h / 2 + 34], [(o.tail ?? 1) * w * 0.25 - 14, h / 2], [-w / 2, h / 2]], GR.paper, { key: 'bb' + str, tear: 1.0, sb: 8, sy: 5 });
  serif(str, 0, size * 0.32, size, GR.ink, { key: 'bbt' + str });
  if (o.check) { const c = popS(o.check); if (c > 0) { ctx.save(); ctx.translate(w / 2 - 6, -h / 2 + 4); ctx.scale(c, c); cut(ellipsePts(0, 0, 30, 30, 0, 20), GR.sageD, { key: 'ck' + str, sb: 4, sy: 3 }); ink([[-12, 0], [-3, 10], [13, -10]], { w: 6, color: GR.paper, amt: 0.2, key: 'ckm' + str }); ctx.restore(); } }
  ctx.restore();
}
function desk(y, key) { cut(rect(-40, y, W + 80, H - y + 40, 0), GR.wood, { key, tear: 0, pat: pat.grainWood('rgba(110,70,40,0.16)'), sy: -6 }); }
function balloon(x, y, s, key) { ink([[x, y + 70 * s], [x + 8 * s, y + 130 * s], [x - 4 * s, y + 190 * s]], { w: 3, color: GR.inkSoft, amt: 0.6, key: key + 's' }); cut(ellipsePts(x, y, 52 * s, 62 * s, 0, 26), GR.blush, { key, sb: 8, sy: 5, crayon: '#D49C86', crAl: 0.3 }); cut([[x - 8 * s, y + 60 * s], [x + 8 * s, y + 60 * s], [x, y + 72 * s]], GR.blush, { key: key + 'k', shadow: false }); }
function battery(x, y, s, key) { cut(rect(x - 70 * s, y - 34 * s, 140 * s, 68 * s, 10 * s), GR.paper, { key, sb: 6, sy: 4 }); ink(rrectPts(x - 70 * s, y - 34 * s, 140 * s, 68 * s, 10 * s), { closed: true, w: 5, color: GR.ink, amt: 0.4, key: key + 'o' }); cut(rect(x + 70 * s, y - 14 * s, 12 * s, 28 * s, 3), GR.ink, { key: key + 'n', shadow: false }); cut(rect(x - 60 * s, y - 24 * s, 30 * s, 48 * s, 4), GR.terra, { key: key + 'l', shadow: false }); }
function doctor(x, y, s, mood) { person(x, y, s, { key: 'doc', shirt: '#F4F2EE', skin: '#B9805F', hair: '#7D7873', glasses: true, mood }); ink([[x - 30 * s, y + 10 * s], [x, y + 90 * s], [x + 30 * s, y + 10 * s]], { w: 4, color: '#C9C2B6', amt: 0.3, key: 'lapel' }); cut(ellipsePts(x + 60 * s, y + 70 * s, 18 * s, 18 * s, 0, 14), GR.dusk, { key: 'steth', sb: 3, sy: 2 }); }
function office(key, bare) {
  wall(GR.wall, { key: key + 'w', pat: pat.stripes('rgba(255,255,255,0.2)', 26, 86) });
  windowLight({ a: 0.18 });
  if (!bare) {
  cut(rect(640, 330, 230, 170, 4), GR.woodL, { key: key + 'dip' }); cut(rect(660, 350, 190, 130, 2), GR.paper, { key: key + 'dipi', shadow: false }); ink([[690, 395], [820, 395]], { w: 3, color: GR.taupe, amt: 0.4, key: key + 'd1' }); ink([[700, 430], [810, 430]], { w: 3, color: GR.taupe, amt: 0.4, key: key + 'd2' });
  clock(220, 420, 70, 10, 15 + TT * 1.5, key + 'ck');
  }
  plant(990, 1060, 0.7, GR.sage, key + 'pl');
}
const report = (x, y, s, key) => {   // a one-page summary: a title bar, a few bars, lines, a gold pattern mark
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  cut(rect(-130, -170, 260, 340, 8), GR.paper, { key, sb: 10, sy: 6 });
  cut(rect(-130, -170, 260, 50, 8), GR.sand, { key: key + 'h', shadow: false, tear: 0.6 });
  [40, 70, 55, 90, 60, 75].forEach((b, i) => cut(rect(-100 + i * 34, 30 - b, 22, b, 3), i === 3 ? GR.gold : GR.sage, { key: key + 'b' + i, shadow: false, grain: 0.3 }));
  [70, 100, 130].forEach((ly, i) => ink([[-100, ly], [100 - i * 30, ly]], { w: 4, color: '#B9AFA3', amt: 0.4, key: key + 'l' + i }));
  ctx.restore();
};

// ---- 1. intro: meet Maya, LV.1 gut guesser
function sIntro() {
  gridPaper('#F2EEE6', 'gridI');
  windowLight({ a: 0.14, vig: 0.12 });
  maya(520, 1170, 1.35, [[0, 'smile'], [CU.bloat, 'worried']]);
  desk(1290, 'deskI');
  gameTag('LV.1  GUT GUESSER', 500, 430, 46, { s: popS(CU.lv - 0.05), rot: -0.02 });
  const nm = popS(CU.maya - 0.05);
  if (nm > 0) { label('Maya', 820, 820, 60, { s: nm, rot: 0.05 }); ink([[760, 860], [700, 920], [650, 950]], { w: 5, color: GR.ink, amt: 0.8, key: 'arrowM', frac: ev(CU.maya, 0.3) }); }
  const b1 = popS(CU.bloat), b2 = popS(CU.bath), b3 = popS(CU.energy);
  if (b1 > 0) { ctx.save(); ctx.translate(210, 760 + Math.sin(TT * 2) * 8); ctx.scale(b1, b1); balloon(0, 0, 1, 'balI'); ctx.restore(); }
  if (b2 > 0) { ctx.save(); ctx.translate(840, 640); ctx.scale(b2, b2); roll(0, 0, 1.3, { key: 'rollI' }); serif('?', 90, -10, 90, GR.ink, { key: 'rq' }); ctx.restore(); }
  if (b3 > 0) { ctx.save(); ctx.translate(250, 560); ctx.scale(b3, b3); battery(0, 0, 0.9, 'batI'); ctx.restore(); }
}

// ---- 2. the doctor: the questions come fast, her mind goes blank, could be stress
function sDoctor() {
  office('of1');
  maya(290, 1130, 1.1, [[0, 'smile'], [CU.since, 'worried'], [CU.blank, 'unsure'], [CU.stress + 0.3, 'down']]);
  doctor(780, 1130, 1.1, TT >= CU.stress ? 'smile' : 'focus');
  desk(1250, 'deskD');
  bubble('Since when?', 690, 540, 50, { s: popS(CU.since - 0.1), tail: 1 });
  bubble('How often?', 740, 680, 50, { s: popS(CU.often - 0.1), tail: 1 });
  bubble('After what?', 640, 820, 50, { s: popS(CU.after - 0.1), tail: 1 });
  const bl = popS(CU.blank - 0.1);   // her thought bubble: empty
  if (bl > 0) { ctx.save(); ctx.translate(250, 640); ctx.scale(bl, bl); cloudy(0, 0, 1.5, { key: 'thought', c: GR.paper, face: false }); [[-40, 150, 16], [-70, 200, 10]].forEach(([a, b, r], i) => cut(ellipsePts(a, b, r, r, 0, 12), GR.paper, { key: 'td' + i, sb: 4, sy: 2 })); serif('…', 4, 34, 90, GR.taupe, { key: 'dots' }); ctx.restore(); }
  const f = springEase(TT - CU.stress, 150, 16);   // a folder lands on the desk
  if (TT >= CU.stress - 0.2) { ctx.save(); ctx.translate(540, lerp(900, 1222, f)); ctx.rotate(-0.06); cut(rect(-220, -70, 440, 150, 8), GR.sand, { key: 'folder', sb: 10, sy: 6 }); cut(rect(-220, -100, 140, 40, 8), GR.sand, { key: 'folderTab', sb: 4, sy: 2 }); serif('could be stress', 0, 22, 54, GR.ink, { key: 'fl' }); ctx.restore(); }
}

// ---- 3. LEVEL UP
function sLevel() {
  cut(rect(-40, -40, W + 80, H + 80, 0), GR.butter, { key: 'lvbg', shadow: false, tear: 0, grain: 0.6 });
  ctx.save(); ctx.translate(540, 900); ctx.rotate(TT * 0.25); ctx.fillStyle = 'rgba(255,248,230,0.75)'; for (let i = 0; i < 18; i++) { ctx.rotate(TAU / 18); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(1400, -120); ctx.lineTo(1400, 120); ctx.closePath(); ctx.fill(); } ctx.restore();
  const R = RNG('conf'); for (let i = 0; i < 26; i++) { const x = R.r(60, 1020), y = mod(R.r(0, 1900) + (TT - TB.level) * R.r(300, 600), 1900), c = [GR.terra, GR.sage, GR.dusk, GR.blush][i % 4]; cut(rot(rect(x, y, 22, 12, 2), x, y, TT * 3 + i), c, { key: 'cf' + i, sb: 3, sy: 2, grain: false }); }
  { const j = springEase(TT - CU.hit, 210, 11), lift = Math.sin(Math.PI * clamp((TT - CU.hit) / 0.42)) * 120;   // she jumps on LEVEL UP, lands with a squash
    const land = TT > CU.hit + 0.42 ? 1 - 0.07 * Math.sin(Math.PI * clamp((TT - CU.hit - 0.42) / 0.2)) : 1; void j;
    mayaBody(540, 1690 - lift, 820, 0, { sx: 2 - land, sy: land }); }
  gameTag('LEVEL UP!', 540, 560, 104, { s: slam(CU.hit), rot: -0.03 });
  gameTag('LV.1  →  LV.2', 540, 720, 40, { s: popS(CU.hit + 0.35), fill: GR.dusk, color: GR.paper });
}

// ---- 4. the four tools, +1 each into the inventory
const SLOTS = [0, 1, 2, 3].map((i) => ({ x: 250 + i * 170, y: 360 }));
const TOOLS = [
  { id: 'LOG', t0: () => CU.s1, done: () => VL('one').t1 - 0.05 },
  { id: 'CONTEXT', t0: () => CU.s2, done: () => VL('two').t1 - 0.05 },
  { id: 'PATTERN', t0: () => CU.s3, done: () => VL('three').t1 - 0.05 },
  { id: 'SUMMARY', t0: () => CU.s4, done: () => VL('four').t1 - 0.05 },
];
function toolIcon(i, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (i === 0) { cut(rect(-38, -46, 76, 92, 6), GR.paper, { key: 'ic0', sb: 4, sy: 3 }); [-18, 0, 18].forEach((ly, k) => ink([[-24, ly], [24, ly]], { w: 4, color: GR.taupe, amt: 0.3, key: 'ic0l' + k })); }
  if (i === 1) { cut(ellipsePts(0, 0, 44, 44, 0, 22), '#FBF9F4', { key: 'ic1', sb: 4, sy: 3 }); food('salmon', 0, 0, 0.45, { key: 'ic1f' }); }
  if (i === 2) { [-26, 0, 26].forEach((dx, k) => cut(rect(dx - 11, -16, 22, 32, 3), GR.paper, { key: 'ic2' + k, sb: 3, sy: 2 })); ink([[-26, -22], [-13, -40], [0, -22], [13, -40], [26, -22]], { w: 5, color: GR.gold, amt: 0.4, key: 'ic2g' }); }
  if (i === 3) report(0, 0, 0.26, 'ic3');
  ctx.restore();
}
function inventory() {
  SLOTS.forEach((p, i) => { cut(rect(p.x - 64, p.y - 64, 128, 128, 14), 'rgba(251,248,242,0.75)', { key: 'slot' + i, sb: 4, sy: 3, grain: 0.3 }); ink(rrectPts(p.x - 64, p.y - 64, 128, 128, 14), { closed: true, w: 3, color: GR.taupe, amt: 0.4, key: 'slotO' + i }); });
}
function sTools() {
  gridPaper('#F2EEE6', 'gridT');
  windowLight({ a: 0.14, vig: 0.12 });
  inventory();
  maya(190, 1250, 0.8, [[0, 'smile'], [CU.s3, 'content']]);
  desk(1330, 'deskT');
  gameTag('LV.2', 190, 960, 30, { fill: GR.dusk, color: GR.paper, rot: -0.04 });
  const cur = TOOLS.findIndex((t, i) => TT >= t.t0() - 0.3 && (i === 3 || TT < TOOLS[i + 1].t0() - 0.3));
  // the big number for the current tool
  if (cur >= 0) gameTag(String(cur + 1), 140, 560, 70, { s: popS(TOOLS[cur].t0() - 0.25), fill: GR.dusk, color: GR.paper });
  // the illustration of the current tool
  const C = { x: 590, y: 860 };
  if (cur === 0) {
    ctx.save(); ctx.translate(C.x, C.y); ctx.scale(popS(CU.s1 - 0.25), popS(CU.s1 - 0.25));
    cut(rect(-230, -200, 460, 400, 10), GR.paper, { key: 'nb', sb: 12, sy: 6, pat: pat.lines('rgba(120,140,160,0.25)', 46, 30) });
    clock(150, -150, 62, 8, 40 + TT, 'nbck');
    ink([[-180, -60], [lerp(-180, 120, ev(CU.happens, 0.6)), -60]], { w: 6, color: GR.ink, amt: 1, key: 'nbw1' });
    if (TT > CU.happens) serif('8:40 pm · bloated', -170, 20, 46, GR.ink, { align: 'left', key: 'nbt', frac: ev(CU.happens + 0.2, 0.6) });
    const m = popS(CU.memory - 0.2); if (m > 0) { cloudy(-60, 140, 0.8 * m, { key: 'mem', c: '#D9D4CC', face: false }); serif('memory', -60, 160, 34, GR.inkSoft, { key: 'memt' }); ink([[-150, 90], [30, 200]], { w: 8, color: GR.terra, amt: 0.5, key: 'x1', frac: ev(CU.memory + 0.3, 0.25) }); ink([[30, 90], [-150, 200]], { w: 8, color: GR.terra, amt: 0.5, key: 'x2', frac: ev(CU.memory + 0.5, 0.25) }); }
    ctx.restore();
  }
  if (cur === 1) {
    const items = [[CU.meals, 'meals', (x, y) => { plate(x, y, 70, 70, { key: 'cm' }); food('salmon', x, y, 0.6, { key: 'cmf' }); }],
      [CU.sleep, 'sleep', (x, y) => { cut(ellipsePts(x, y, 56, 56, 0, 26), GR.duskD, { key: 'moon', sb: 6, sy: 4 }); cut(ellipsePts(x + 26, y - 18, 50, 50, 0, 26), '#F2EEE6', { key: 'moonc', shadow: false }); }],
      [CU.stress2, 'stress', (x, y) => ink([[x - 60, y], [x - 36, y - 40], [x - 12, y + 30], [x + 12, y - 40], [x + 36, y + 30], [x + 60, y - 10]], { w: 9, color: GR.terra, amt: 0.6, key: 'zig' })],
      [CU.cycle, 'cycle', (x, y) => { for (let k = 0; k < 28; k++) { const a = k / 28 * TAU - Math.PI / 2; dot(x + Math.cos(a) * 54, y + Math.sin(a) * 54, k < 5 ? 8 : 5, k < 5 ? GR.blush : GR.taupe); } }]];
    items.forEach(([t, name, draw], k) => { const s = popS(t - 0.12); if (s <= 0) return; const x = C.x + (k % 2 ? 150 : -150), y = C.y + (k < 2 ? -150 : 160); ctx.save(); ctx.translate(x, y); ctx.scale(s, s); cut(rect(-120, -120, 240, 240, 16), GR.paper, { key: 'cc' + k, sb: 8, sy: 5 }); draw(0, -20); serif(name, 0, 96, 40, GR.ink, { key: 'ccn' + k }); ctx.restore(); });
  }
  if (cur === 2) {
    const R = { y: C.y - 80 };
    for (let d = 0; d < 6; d++) { const s = popS(CU.s3 + d * 0.05); dayCard(C.x - 290 + d * 100, R.y, 84, 120, { key: 'wk' + d, s }); }
    [[0, 1], [2, 3], [4, 5]].forEach(([a, b], k) => goldLink([C.x - 290 + a * 100 + 60, R.y + 50], [C.x - 290 + b * 100 + 30, R.y + 80], EZ.o2(ev(CU.pattern - 0.1 + k * 0.12, 0.4)), { key: 'tl' + k, w: 8 }));
    label('a few weeks', C.x - 20, R.y + 250, 56, { s: popS(CU.weeks - 0.1), rot: -0.03 });
  }
  if (cur === 3) {
    const st = popS(CU.s4 - 0.2), cross = ev(CU.story + 0.15, 0.3);
    ctx.save(); ctx.translate(C.x - 170, C.y); ctx.scale(st, st);
    cut([[-90, -220], [90, -230], [100, 220], [-80, 240]], '#EFE8DC', { key: 'scroll', sb: 8, sy: 5, tear: 2.4 });
    for (let k = 0; k < 9; k++) ink([[-60, -180 + k * 44], [60 + Math.sin(k * 2) * 20, -170 + k * 44]], { w: 3, color: '#B9AFA3', amt: 2, key: 'scl' + k });
    serif('story', 0, 300, 44, GR.inkSoft, { key: 'scst' });
    ink([[-110, -200], [110, 220]], { w: 9, color: GR.terra, amt: 0.6, key: 'scx', frac: cross });
    ctx.restore();
    const sm = popS(CU.summary - 0.1); if (sm > 0) { report(C.x + 160, C.y, 1.0 * sm, 'rep'); serif('summary', C.x + 160, C.y + 230, 44, GR.ink, { key: 'smt' }); }
  }
  // finished tools fly into their slots; "+1" pops beside the inventory
  TOOLS.forEach((t, i) => {
    if (TT < t.done()) return;
    const u = springEase(TT - t.done(), 170, 20), x = lerp(C.x, SLOTS[i].x, u), y = lerp(C.y, SLOTS[i].y, u);
    toolIcon(i, x, y, lerp(2, 1, u));
    const b = popS(t.done() + 0.25) * (1 - EZ.i2(ev(t.done() + 1.2, 0.3)));
    if (b > 0.01) gameTag('+1 ' + t.id, SLOTS[i].x, SLOTS[i].y + 112, 30, { s: b, rot: -0.04 });
  });
}
function hardHat(x, y, s) {   // the level-2 hat (the reference's grammar: the hero gets gear)
  cut([[x - 92 * s, y - 196 * s], [x - 80 * s, y - 250 * s], [x - 30 * s, y - 280 * s], [x + 30 * s, y - 280 * s], [x + 80 * s, y - 250 * s], [x + 92 * s, y - 196 * s]], GR.butter, { key: 'hat', sb: 6, sy: 4, crayon: '#D8C38A', crAl: 0.3 });
  cut(rect(x - 110 * s, y - 206 * s, 220 * s, 22 * s, 8 * s), '#E0CA8C', { key: 'hatb', sb: 4, sy: 2 });
}

// ---- 5. back at the doctor: the questions have answers
function sBoss() {
  office('of2', true);
  inventory(); [0, 1, 2, 3].forEach((i) => toolIcon(i, SLOTS[i].x, SLOTS[i].y, 1));
  gameTag('FULLY EQUIPPED', 540, 500, 40, { s: popS(TB.boss + 0.1) * (1 - EZ.i2(ev(CU.answers - 0.3, 0.3))), fill: GR.sageD, color: GR.paper });
  maya(290, 1130, 1.1, [[0, 'content'], [CU.answers, 'happy']]);
  doctor(780, 1130, 1.1, TT >= CU.answers + 0.4 ? 'happy' : 'smile');
  desk(1250, 'deskB');
  gameTag('LV.2', 290, 840, 30, { fill: GR.dusk, color: GR.paper, rot: -0.04 });
  const slide = springEase(TT - (TB.boss + 0.2), 120, 18);
  report(lerp(330, 560, slide), 1170, 0.6, 'repB');
  ['Since when?', 'How often?', 'After what?'].forEach((q, k) => bubble(q, [690, 740, 640][k], [540, 680, 820][k], 50, { s: 1, tail: 1, check: CU.answers + k * 0.22 }));
}

// ---- 6. from guessing, to knowing
function sFromTo() {
  gridPaper('#F2EEE6', 'gridF');
  windowLight({ a: 0.14, vig: 0.12 });
  serif('from', 250, 700, 64, GR.inkSoft, { align: 'left', key: 'from', frac: ev(TB.from, 0.3) });
  serif('guessing', 250, 840, 150, GR.ink, { align: 'left', key: 'guess', frac: ev(CU.guessing - 0.15, 0.4) });
  const st = ev(CU.guessing + 0.55, 0.35); if (st > 0) ink([[240, 800], [440, 776], [640, 812], [860, 784]], { w: 12, color: GR.terra, amt: 1.2, key: 'strike', frac: st });
  serif('to', 250, 1000, 64, GR.inkSoft, { align: 'left', key: 'to', frac: ev(CU.knowing - 0.35, 0.25) });
  serif('knowing', 250, 1140, 150, GR.dusk, { align: 'left', key: 'know', frac: ev(CU.knowing - 0.1, 0.5) });
  const ul = ev(CU.knowing + 0.45, 0.4); if (ul > 0) ink([[250, 1170], [500, 1180], [760, 1166]], { w: 9, color: GR.gold, amt: 0.8, key: 'ul', frac: ul });
  const pk = springEase(TT - (CU.knowing + 0.3), 150, 16); if (TT > CU.knowing + 0.3) { mayaBody(lerp(1260, 900, pk), 1760, 560, lerp(-0.25, -0.08, pk)); }
}

// ---- 7. end card: the report, understand your gut, download
function sEnd() {
  cut(rect(-40, -40, W + 80, H + 80, 0), GR.dark, { key: 'wallE', shadow: false, tear: 0, shade: false, grain: 0.5 });
  windowLight({ a: 0.06, vig: 0.3 });
  drawAsset('logo-white.svg', 540 - 250, 520, 500, 170, { fit: 'contain' });
  serif('Understand your gut.', 540, 790, 80, GR.cream, { key: 'tagE', frac: EZ.o2(ev(TB.end + 0.3, 0.9)) });
  const r = popS(CU.report - 0.15); if (r > 0) report(540, 1010, 0.62 * r, 'repE');
  const cb = popS(VL('app').t1 + 0.3);
  if (cb > 0) { ctx.save(); ctx.translate(540, 1270); ctx.scale(cb, cb); cut(rect(-300, -62, 600, 124, 62), GR.cream, { key: 'ctaBtn', sb: 12, sy: 6 }); sans('Download Get Regular', 0, -4, 44, GR.dark, { weight: 700 }); sans('Start logging today', 0, 38, 30, GR.inkSoft, { weight: 500 }); ctx.restore(); }
  sans('Educational only. Not medical advice.', 540, 1380, 24, '#9C9389', { weight: 500 });
}
