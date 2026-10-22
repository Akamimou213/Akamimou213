// =====================================================================
//  SCENES — one function per era, world coordinates 1080x1920, cued from the voice (TIMELINE.cues).
//  Each: a full-bleed paper world in window light, the idea acted out, small background life.
// =====================================================================
const CU = TIMELINE.cues;
const DINNER = ['salmon', 'rice', 'greens'];
const PLATE0 = { x: 540, y: 1238, rx: 250, ry: 80 };

// ---- 1. dinner: most of us blame the last thing we ate
function sDinner() {
  wall(GR.wall, { key: 'wallD', pat: pat.stripes('rgba(255,255,255,0.20)', 26, 86) });
  windowLight({ a: 0.24 });
  // the window (evening), the cat on the sill
  cut(rect(86, 330, 300, 390, 6), GR.woodL, { key: 'winD' });
  cut(rect(108, 352, 256, 346, 2), GR.duskD, { key: 'glassD', shadow: false, pat: (bb) => { const R = RNG('starsD'); for (let i = 0; i < 14; i++) sparkle(R.r(bb.x0, bb.x1), R.r(bb.y0, bb.y0 + 200), R.r(3, 6) * (0.6 + 0.4 * ((B + i) % 2))); } });
  cut(ellipsePts(300, 430, 30, 30, 0, 24), '#F3EAD0', { key: 'moonD' });
  cut(rect(232, 352, 8, 346, 0), GR.woodL, { key: 'mullD', shadow: false });
  cut(rect(66, 700, 340, 28, 4), GR.wood, { key: 'sillD' });
  cat(250, 676, 0.72, '#5d5652', 'catD');
  // the clock: on "delay" it grows and its hands race
  const cs = 1 + 0.32 * springEase(TT - CU.clock, 120, 16), race = Math.max(0, TT - CU.clock) * 600;
  clock(830, 440, 82 * cs, 7, 40 + TT * 0.5 + race, 'clockD');
  // the pendant lamp and its glow
  ink([[560, -20], [560, 250]], { w: 3, color: GR.ink, amt: 0.3, key: 'cordD' });
  cut([[480, 330], [640, 330], [606, 250], [514, 250]], '#3C3530', { key: 'shadeD' });
  const glow = ctx.createRadialGradient(560, 360, 20, 560, 560, 520); glow.addColorStop(0, 'rgba(255,224,170,0.32)'); glow.addColorStop(1, 'rgba(255,224,170,0)');
  ctx.fillStyle = glow; ctx.fillRect(0, 200, W, 1000);
  plant(960, 1080, 0.75, GR.terra, 'plantD');
  // the diner, behind the table
  const pointing = TT >= CU.point;
  woman(540, 1090, 1.42, { key: 'diner', shirt: GR.sage, skin: GR.skin, hair: GR.hair, mood: pointing ? 'sad' : 'smile', shirtPat: pat.stripes('rgba(255,255,255,0.18)', 8, 30) });
  // the table, a runner, the plate
  cut(rect(-40, 1128, W + 80, 900, 0), GR.wood, { key: 'tableD', tear: 0, pat: pat.grainWood('rgba(110,70,40,0.16)'), sy: -6 });
  cut(rect(-40, 1150, W + 80, 210, 0), GR.cream, { key: 'runnerD', tear: 1.2, shadow: false, pat: pat.gingham('rgba(118,137,107,0.16)', 14) });
  ink([[180, 1190], [180, 1300]], { w: 9, color: '#9C9389', amt: 0.4, key: 'forkD' });
  ink([[910, 1180], [910, 1300]], { w: 11, color: '#9C9389', amt: 0.4, key: 'knifeD' });
  cut(rect(800, 1070, 74, 130, 14), 'rgba(205,222,228,0.85)', { key: 'glassW', sb: 8, sy: 5, pat: pat.stripes('rgba(255,255,255,0.4)', 8, 60, 0.2) });
  plate(PLATE0.x, PLATE0.y, PLATE0.rx, PLATE0.ry, { key: 'plD' });
  food('salmon', 470, 1222, 0.95, { key: 'dS', rot: -0.1 });
  food('rice', 610, 1230, 0.95, { key: 'dR' });
  food('greens', 545, 1262, 0.9, { key: 'dG' });
  for (let i = 0; i < 3; i++) { const P = []; for (let k = 0; k <= 9; k++) P.push([500 + i * 40 + Math.sin(k * 0.9 + i + TT * 4) * 8, 1180 - k * 11]); ink(P, { w: 4, color: 'rgba(255,255,255,0.7)', amt: 0.6, key: 'stD' + i }); }
  // the stamp lands on the plate
  stamp('SUSPECT', 560, 1140, 54, { s: slam(CU.stamp), rot: -0.1 });
}

// ---- 2. the train through the gut: ~29 hours; something new pushes the rest along; the light moves back
const CARS = [
  { id: 'yesterday', foods: ['pasta'], c: GR.dusk, f: 0.79 },
  { id: 'breakfast', foods: ['toast', 'coffee'], c: GR.sand, f: 0.56 },
  { id: 'lunch', foods: ['sandwich', 'apple'], c: GR.sageD, f: 0.34 },
];
const SHOVE = 0.07;
function carF(i) {   // where each carriage sits on the track at TT (0 = the way in, 1 = the way out)
  const base = i < 3 ? CARS[i].f : 0.045;
  if (i === 3 && TT < CU.newMeal + 0.6) return springMove(CU.newMeal - 0.2, -0.12, base, SPRING.smooth);
  return base + SHOVE * springEase(TT - CU.shove, 140, 15);
}
function sTrack() {
  wall(GR.cream, { key: 'wallT', pat: pat.dots('rgba(160,135,105,0.10)', 3, 46) });
  windowLight({ a: 0.18, vig: 0.12 });
  // background life: grass tufts, a signal post that blinks, the way in and out
  [[60, 560], [990, 900], [70, 1080], [990, 1330]].forEach(([x, y], i) => { for (let j = 0; j < 4; j++) cut(rot(ellipsePts(x + j * 12, y - 20, 7, 30, 0, 10), x + j * 12, y, (j - 1.5) * 0.25 + Math.sin(TT * 2 + i) * 0.04), j % 2 ? GR.sage : GR.sageD, { key: 'tuft' + i + j, sb: 3, sy: 2 }); });
  cut(rect(944, 600, 12, 170, 4), GR.taupe, { key: 'post' });
  cut(ellipsePts(950, 600, 22, 22, 0, 18), '#3C3530', { key: 'lampT' });
  dot(950, 600, 11, B % 12 < 6 ? GR.goldL : '#6c625a');
  track();
  cut([[70, 530], [70, 420], [110, 380], [190, 380], [230, 420], [230, 530]], GR.terra, { key: 'arch', sb: 8, sy: 5, pat: pat.stripes('rgba(255,255,255,0.2)', 10, 28) });
  serif('in', 150, 470, 58, GR.paper, { key: 'in' });
  label('out', 110, 1360, 44, { rot: 0.04 });
  // act 1: one meal travels the whole way; the counter counts the hours
  const hEnd = VL('hours').t1, trainOn = TT >= CU.train;
  if (!trainOn) {
    const u = EZ.io(seg(TT, CU.travel0, CU.travel1)), [x, y] = trackAt(-0.02 + u * 1.12);
    carriage(x, y, DINNER, GR.terra, { key: 'carT', moving: u > 0 && u < 1 });
    for (let i = 0; i < 3 && u > 0 && u < 1; i++) { const p = mod(TT * 2 + i / 3, 1); cut(ellipsePts(x - 60 - p * 60, y - 150 - p * 90, 14 + p * 22, 12 + p * 16, 0, 14), 'rgba(255,255,255,0.75)', { key: 'puff' + i, shadow: false, grain: false }); }
    const n = Math.round(29 * u), cs = popS(CU.travel0 - 0.2) * (1 - EZ.i2(ev(hEnd + 0.4, 0.3)));
    if (cs > 0.01) {
      ctx.save(); ctx.translate(540, 318); ctx.scale(cs, cs);
      cut(rect(-250, -80, 500, 150, 6), GR.paper, { key: 'ctr', tear: 1.3, sb: 8, sy: 5 });
      serif(`${n} hours`, 0, 18, 92, GR.ink, { key: 'ctrN' });
      sans('median, healthy adults · Asnicar et al., Gut 2021', 0, 56, 22, GR.inkSoft, { weight: 500 });
      ctx.restore();
    }
  }
  // act 2: the train; a new meal comes in and pushes the rest along
  if (trainOn) {
    CARS.forEach((c, i) => { const [x, y] = trackAt(carF(i)); carriage(x, y, c.foods, c.c, { key: 'car' + c.id, s: popS(CU.train + i * 0.12), label: c.id, moving: TT > CU.shove && TT < CU.shove + 0.6 }); });
    if (TT >= CU.newMeal - 0.2) { const [x, y] = trackAt(carF(3)); carriage(x, y, DINNER, GR.terra, { key: 'cardinner', label: 'dinner', moving: TT < CU.shove + 0.6 }); }
    if (TT >= CU.shove && TT < CU.shove + 0.5) { const [x, y] = trackAt(carF(3) + 0.03), k = ev(CU.shove, 0.5); for (let j = 0; j < 3; j++) ink([[x + 30, y - 70 + j * 26], [x + 30 + 30 + k * 40, y - 80 + j * 30]], { w: 5, color: GR.ink, amt: 0.4, key: 'bump' + j }); }
    // act 3: the spotlight catches the newest carriage, then moves back down the train
    const pos = (i) => { const [x, y] = trackAt(carF(i)); return [x, y - 80]; };
    const sx = springTrack([[0, pos(3)[0]], [CU.lunch - 0.25, pos(2)[0]], [CU.yesterday - 0.25, pos(0)[0]]], SPRING.smooth);
    const sy = springTrack([[0, pos(3)[1]], [CU.lunch - 0.25, pos(2)[1]], [CU.yesterday - 0.25, pos(0)[1]]], SPRING.smooth);
    const a = 0.58 * EZ.o2(ev(CU.caught - 0.5, 0.45));
    if (a > 0) {
      spotlight(sx, sy, 200, a);
    }
    if (TT >= CU.caught) { const [x, y] = pos(3); stamp('SUSPECT', x + 14, y - 30, 40, { s: slam(CU.caught), rot: -0.14 }); }
    const [lx, ly] = pos(2), [yx, yy] = pos(0);
    markerCircle(lx, ly - 10, 150, 125, EZ.o2(ev(CU.lunch, 0.45)), 'mcL');
    markerCircle(yx, yy - 10, 150, 125, EZ.o2(ev(CU.yesterday, 0.45)), 'mcY');
  }
}

// ---- 3. cut the wrong food: the cloud stays, the plate gets smaller
const PLATE_FOODS = [['salmon', -0.4, 0.95], ['rice', 0.9, 1], ['greens', 2.0, 1], ['broccoli', 3.0, 1], ['bread', 4.1, 1], ['cheese', 5.2, 1]];
function sPlate() {
  cut(rect(-40, -40, W + 80, H + 80, 0), GR.woodL, { key: 'tableP', shadow: false, tear: 0, pat: pat.grainWood('rgba(120,80,45,0.16)') });
  cut(rect(110, 560, 860, 820, 10), GR.cream, { key: 'matP', tear: 1.2, sb: 10, sy: 6, pat: pat.gingham('rgba(118,137,107,0.15)', 16) });
  windowLight({ a: 0.2, vig: 0.18 });
  // the symptom stays put through every cut (a little shake on "nothing changes")
  const shake = TT > CU.nothing && TT < CU.nothing + 0.6 ? Math.sin((TT - CU.nothing) * 40) * 10 * (1 - ev(CU.nothing, 0.6)) : 0;
  cloudy(540 + shake, 400, 1.25, { key: 'clP', mood: 'sad' });
  // the plate shrinks on "smaller"
  const r = springMove(CU.smaller - 0.05, 330, 140, SPRING.heavy);
  ink([[200, 760], [200, 1180]], { w: 12, color: '#9C9389', amt: 0.4, key: 'forkP' });
  ink([[880, 760], [880, 1180]], { w: 14, color: '#9C9389', amt: 0.4, key: 'knifeP' });
  cut(ellipsePts(540, 970, r, r, 0, 56), '#FBF9F4', { key: 'plP', sb: 16, sy: 9, shade: false, grain: 0.4 });
  cut(ellipsePts(540, 970, r * 0.74, r * 0.74, 0, 48), '#F3EEE5', { key: 'plPi', shadow: false, grain: 0.4, shade: false });
  // the foods tear away one by one: the suspect first, then the rest
  const tOut = [CU.cut + 0.15, CU.nothing - 0.25, CU.nothing + 0.15, CU.nothing + 0.5, CU.smaller - 0.45, CU.smaller - 0.15];
  PLATE_FOODS.forEach(([f, a, s], i) => {
    if (i === PLATE_FOODS.length - 1 && TT < tOut[i] + 2) { /* the last bite stays */ }
    const gone = EZ.i2(ev(tOut[i], 0.45)); if (gone >= 1 && i < PLATE_FOODS.length - 1) return;
    const keep = i === PLATE_FOODS.length - 1, rr = r * 0.48, x = 540 + Math.cos(a) * rr, y = 970 + Math.sin(a) * rr * 0.92;
    const fly = keep ? 0 : gone, sc = keep ? r / 330 : s * (1 - 0.4 * fly);
    food(f, x + fly * (i % 2 ? 380 : -380), y - fly * 900, 1.05 * sc, { key: 'pf' + i, rot: fly * (i % 2 ? 2 : -2) });
    if (i === 0 && TT >= CU.cut - 0.4 && fly < 0.4) stamp('SUSPECT', x + 10, y - 60, 34, { s: 1, rot: -0.12 });
  });
  cut(ellipsePts(860, 1300, 60, 60, 0, 30), 'rgba(205,222,228,0.85)', { key: 'glassP', sb: 8, sy: 5 });
  for (let i = 0; i < 9; i++) { const R = RNG('crumb', i); dot(R.r(300, 800), R.r(1200, 1340), R.r(2, 5), '#C49A6C'); }
}

// ---- 4. one day vs three weeks: the gold line; Get Regular lines them up
const GRID = { x0: 60, y0: 566, w: 112, h: 196, gx: 120, gy: 210 };
const TRIG = [1, 4, 8, 12, 15, 18], SYMP = [2, 5, 6, 9, 13, 16, 19], ROLL = [0, 1, 2, 3, 4, 6, 7, 8, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20];
const HERO = 9;
const slot = (i) => ({ x: GRID.x0 + (i % 7) * GRID.gx, y: GRID.y0 + Math.floor(i / 7) * GRID.gy, w: GRID.w, h: GRID.h });
const BIG = { x: 300, y: 560, w: 480, h: 600 };
const MEAL_DOTS = (i) => { const R = RNG('meal', i); return [0, 1, 2].map((j) => [GR.sage, GR.sand, GR.blush, GR.sageD][(R.f() * 4) | 0]); };
function heroRect() {   // the one day: big, then it flies into its slot as the weeks fan out
  const u = springEase(TT - CU.fan, 110, 18), S = slot(HERO);
  return { x: lerp(BIG.x, S.x, u), y: lerp(BIG.y, S.y, u), w: lerp(BIG.w, S.w, u), h: lerp(BIG.h, S.h, u), u };
}
function cardContent(i, R, k) {   // meals across the top, a symptom cloud, a bathroom roll
  const m = MEAL_DOTS(i), u = R.w / GRID.w, pulseM = 1 + 0.25 * Math.sin(Math.PI * ev(CU.meals, 0.4)), pulseS = 1 + 0.25 * Math.sin(Math.PI * ev(CU.symptoms, 0.4));
  m.forEach((c, j) => { const trig = TRIG.includes(i) && j === 2; const x = R.x + R.w * (0.24 + j * 0.26), y = R.y + R.h * 0.34; cut(trig ? rect(x - 11 * u * pulseM, y - 11 * u * pulseM, 22 * u * pulseM, 22 * u * pulseM, 3 * u) : ellipsePts(x, y, 11 * u * pulseM, 11 * u * pulseM, 0, 14), trig ? GR.terra : c, { key: k + 'm' + j, sb: 3, sy: 2, grain: 0.3 }); });
  if (SYMP.includes(i)) cloudy(R.x + R.w * 0.42, R.y + R.h * 0.66, 0.24 * u * pulseS, { key: k + 'c', face: u > 2, mood: 'sad' });
  if (ROLL.includes(i) && TT >= CU.bathroom) roll(R.x + R.w * 0.8, R.y + R.h * 0.72, 0.28 * u * popS(CU.bathroom + (i % 7) * 0.04), { key: k + 'r' });
}
const trigPt = (i, R) => [R.x + R.w * 0.76, R.y + R.h * 0.34];
const sympPt = (i, R) => [R.x + R.w * 0.42, R.y + R.h * 0.62];
function sDays() {
  wall(GR.wall, { key: 'wallC', pat: pat.lines('rgba(160,135,105,0.10)', 44) });
  windowLight({ a: 0.2, vig: 0.12 });
  const hero = heroRect(), fanned = TT >= CU.fan;
  // weekday letters
  if (fanned) 'MTWTFSS'.split('').forEach((d, c) => sans(d, GRID.x0 + c * GRID.gx + GRID.w / 2, GRID.y0 - 22, 30, GR.taupe, { weight: 700, ls: '1px' }));
  // the other twenty days pop in around the one
  for (let i = 0; i < 21; i++) {
    if (i === HERO) continue;
    const s = popS(CU.fan + 0.05 + i * 0.022); if (s <= 0) continue;
    const R = slot(i), hl = TT >= CU.daybyday && Math.floor(ev(CU.daybyday, 1.4) * 7) === i % 7 && ev(CU.daybyday, 1.4) < 1;
    dayCard(R.x, R.y, R.w, R.h, { key: 'd' + i, s, band: hl ? GR.taupe : GR.sand });
    if (s > 0.6) { sans(String(i + 1), R.x + 16, R.y + 20, 22, GR.paper, { weight: 700, align: 'left' }); cardContent(i, R, 'd' + i); }
  }
  // the one day (a symptom, and the meal you'd blame)
  dayCard(hero.x, hero.y, hero.w, hero.h, { key: 'dHero', titleSize: lerp(64, 1, hero.u) });
  if (hero.u < 0.3) { serif('Tuesday', hero.x + hero.w / 2, hero.y + hero.h * 0.32 - 40, 64, GR.ink, { key: 'tue' }); food('salmon', hero.x + hero.w * 0.5, hero.y + hero.h * 0.5, 1.3 * (1 - hero.u * 3), { key: 'hs' }); cloudy(hero.x + hero.w * 0.5, hero.y + hero.h * 0.78, 1.1 * (1 - hero.u * 3), { key: 'hc', mood: 'sad' }); }
  else { sans(String(HERO + 1), hero.x + 16, hero.y + 20, 22, GR.paper, { weight: 700, align: 'left' }); cardContent(HERO, hero, 'dH'); }
  // THE PAYOFF: the rest of the grid steps back, the gold line connects each trigger to the next day's symptom
  const veil = 0.5 * EZ.o2(ev(CU.hit - 0.08, 0.25)) * (1 - EZ.o2(ev(CU.meals - 0.2, 0.5)));
  if (veil > 0.01) { ctx.fillStyle = `rgba(236,229,218,${veil})`; ctx.fillRect(40, GRID.y0 - 60, 860, 3 * GRID.gy + 40); }
  const pulse = 1 + 0.5 * Math.sin(Math.PI * ev(CU.pattern, 0.5));
  TRIG.forEach((d, j) => { if (!SYMP.includes(d + 1)) return; const A = d + 1 === HERO ? hero : slot(d + 1); goldLink(trigPt(d, slot(d)), sympPt(d + 1, A), EZ.o2(ev(CU.hit + j * 0.07, 0.35)), { key: 'gl' + d, w: 10 * pulse, lift: 58 }); });
  const nd = popS(CU.hit + 0.45) * (1 - EZ.i2(ev(CU.logo - 0.1, 0.25)));
  if (nd > 0.01) { const a = trigPt(HERO - 1, slot(HERO - 1)), S = slot(HERO); label('next day', (a[0] + S.x + S.w * 0.42) / 2, S.y + S.h * 0.86, 38, { s: nd, rot: -0.04 }); }
  // "a few weeks"
  const wk = popS(CU.weeks) * (1 - EZ.i2(ev(CU.logo - 0.1, 0.25)));
  if (wk > 0.01) label('3 weeks', 500, 1268, 64, { s: wk, rot: -0.02 });
  // Get Regular: the logo, then the legend on its words
  if (TT >= CU.logo) {
    const s = popS(CU.logo);
    ctx.save(); ctx.translate(540, 410); ctx.scale(s, s);
    cut(rect(-250, -86, 500, 172, 8), GR.paper, { key: 'logoCard', sb: 10, sy: 6 });
    drawAsset('logo-black.svg', -200, -66, 400, 136, { fit: 'contain' });
    ctx.restore();
    const chip = (t, x, w, txt, icon) => { const s2 = popS(t); if (s2 <= 0) return; ctx.save(); ctx.translate(x, 1262); ctx.scale(s2, s2); cut(rect(-w / 2, -40, w, 80, 40), GR.paper, { key: 'chip' + txt, sb: 6, sy: 4 }); icon(-w / 2 + 44, 0); sans(txt, -w / 2 + 80, 14, 36, GR.ink, { align: 'left', weight: 500 }); ctx.restore(); };
    chip(CU.meals, 200, 230, 'meals', (x, y) => cut(ellipsePts(x, y, 16, 16, 0, 14), GR.sage, { key: 'chM', sb: 3, sy: 2 }));
    chip(CU.symptoms, 470, 280, 'symptoms', (x, y) => cloudy(x + 4, y - 4, 0.3, { key: 'chS', face: false }));
    chip(CU.bathroom, 760, 270, 'bathroom', (x, y) => roll(x, y, 0.42, { key: 'chR' }));
  }
}

// ---- 5. end card: understand your gut
function sEnd() {
  cut(rect(-40, -40, W + 80, H + 80, 0), GR.dark, { key: 'wallE', shadow: false, tear: 0, shade: false, grain: 0.5 });
  windowLight({ a: 0.06, vig: 0.3 });
  drawAsset('logo-white.svg', 540 - 270, 660, 540, 184, { fit: 'contain' });
  serif('Understand your gut.', 540, 960, 84, GR.cream, { key: 'tagE', frac: EZ.o2(ev(TB.end + 0.3, 0.9)) });
  // the callback: three days, the gold line between them
  const P = [[330, 1110], [540, 1110], [750, 1110]];
  P.forEach(([x, y], i) => dayCard(x - 50, y - 60, 100, 120, { key: 'de' + i, s: popS(TB.end + 0.6 + i * 0.1) }));
  goldLink([P[0][0] + 20, P[0][1] - 10], [P[1][0] - 10, P[1][1]], EZ.o2(ev(CU.close + 0.3, 0.5)), { key: 'ge0', lift: 50 });
  goldLink([P[1][0] + 20, P[1][1] - 10], [P[2][0] - 10, P[2][1]], EZ.o2(ev(CU.close + 0.6, 0.5)), { key: 'ge1', lift: 50 });
  sans('Educational only. Not medical advice.', 540, 1290, 28, '#9C9389', { weight: 500 });
}
