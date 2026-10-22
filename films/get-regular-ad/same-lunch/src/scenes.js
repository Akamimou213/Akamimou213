// =====================================================================
//  SCENES — Same Lunch, Different Day (sketchbook). World coords 1080x1920 (the page), cued from the voice.
// =====================================================================
const CU = TIMELINE.cues;
const THU = { x: 540, y: 760 };

// ---- 1. same lunch: fine on Monday, rough on Thursday. Is it the lunch?
function sDays() {
  sketchPage({ grid: 'dots' });
  [[90, 470, 0], [980, 540, 1], [100, 1220, 2]].forEach(([x, y, i]) => doodleStar(x, y, 20 + 6 * ((B + i) % 3 === 0), 'st' + i, { w: 3 }));
  const card = (x, y, day, mood, t, key) => {
    const k = 1;   // on the page from frame 0 (the thumbnail); the day name writes on with the voice
    const P = sketchBox(x, y, 400, 560, 14, 0.03);
    gfill(P, SK.sheet, { a: 0.95, off: [6, 7], key: key + 'f' }); gline(P, { w: 4, key: key + 'o', closed: true, part: k });
    handLetter(day, x + 200, y + 86, 76, { weight: 700, reveal: ev(t, 0.3), key: key + 'd' });
    maya(x + 200, y + 400, 0.62, { key: key + 'm', mood, part: k });
    doodle('sandwich', x + 200, y + 488, 0.8, { key: key + 's', part: k });
  };
  card(90, 520, 'Monday', 'happy', CU.mon, 'mon');
  card(560, 520, 'Thursday', TT >= CU.thu + 0.4 ? 'rough' : 'smile', CU.thu, 'thu');
  if (TT >= CU.mon + 0.5) checkMark(400, 600, 1.1, ev(CU.mon + 0.5, 0.3), SK.green, 'monck');
  if (TT >= CU.thu + 0.4) doodle('storm', 760, 650, 0.8, { key: 'thuS', part: ev(CU.thu + 0.4, 0.4) });
  // "is it the lunch?": a graphite ring around Thursday's sandwich and a question mark
  const q = ev(CU.q - 0.2, 0.5);
  if (q > 0) { gline(loopPts(760, 1008, 120, 80, 0.12), { w: 5, key: 'qring', part: q, col: SK.ink }); handLetter('?', 910, 960, 120, { weight: 700, reveal: ev(CU.q + 0.2, 0.2), key: 'qm' }); }
}

// ---- 2. the cup: foods stack; a short night, stress, the cycle add; the same lunch spills it
const LAYERS = [   // [cue, kind, height, label]
  ['f1', 'toast', 52, null], ['f2', 'coffee', 48, null], ['f3', 'apple', 52, null], ['f4', 'sandwich', 56, 'meals'],
  ['night', 'moon', 86, 'a short night'], ['stress', 'stress', 86, 'a stressful week'], ['period', 'cycle', 86, 'your period'],
];
function sCup() {
  sketchPage({ grid: 'dots' });
  doodleBird(860 + Math.sin(TT * 0.7) * 30, 420, 1.2, (B % 4) / 4, 'bird1'); doodleBird(930 + Math.sin(TT * 0.7 + 1) * 30, 460, 0.9, ((B + 2) % 4) / 4, 'bird2');
  // "more like a cup than a switch": the switch is drawn and crossed out; the cup is drawn
  const sw = ev(CU.sw - 0.2, 0.4);
  if (sw > 0 && TT < CU.f1 + 0.6) {
    const P = sketchBox(800, 700, 120, 190, 14, 0.03); gfill(P, SK.sheet, { key: 'swf' }); gline(P, { w: 4, key: 'sw', closed: true, part: sw });
    gline(sketchBox(835, 740, 50, 110, 10, 0.02), { w: 3.5, key: 'swi', closed: true, part: sw });
    const x = ev(CU.sw + 0.4, 0.3); if (x > 0) { gline([[780, 690], [940, 910]], { w: 7, col: SK.red, key: 'swx1', part: x, second: false }); gline([[940, 690], [780, 910]], { w: 7, col: SK.red, key: 'swx2', part: ev(CU.sw + 0.6, 0.3), second: false }); }
  }
  const cupK = ev(CU.cup - 0.3, 0.6);
  // contents: each layer drops in, then settles as a band of the accent
  let level = CUP.bot;
  LAYERS.forEach(([cue, kind, h, lab], i) => {
    const t = CU[cue]; if (TT < t - 0.35) return;
    const fall = EZ.i2(ev(t - 0.35, 0.35));
    if (fall < 1) { doodle(kind, CUP.cx, lerp(380, level - h / 2, fall), 0.9, { key: 'drop' + i }); return; }
    const y1 = level, y0 = level - h * springEase(TT - t, 200, 18); level = y0;
    ctx.save(); gclip(band(y0, y1)); scribbleFill(band(y0 - 2, y1 + 2), ACC, { key: 'lay' + i, gap: 11 + (i % 3) * 2, w: 4, ang: i % 2 ? 0.5 : -0.5, base: 0.35 }); ctx.restore();
    gpencil([[cupX(y0, -1) + 6, y0], [cupX(y0, 1) - 6, y0]], { w: 2.5, key: 'sep' + i, a: 0.7 });
    if (lab) { const ly = (y0 + (lab === 'meals' ? CUP.bot : y1)) / 2; handLetter(lab, cupX(ly, 1) + 66, ly + 14, 44, { weight: 700, align: 'left', reveal: ev(t, 0.4), key: 'lab' + i }); if (TT >= CU.everything) underline(cupX(ly, 1) + 66, cupX(ly, 1) + 66 + fontW(lab, `700 44px ${HAND}`), ly + 26, { col: ACC, key: 'ul' + i, part: ev(CU.everything + i * 0.08, 0.3) }); }
  });
  // the same lunch: it hovers, falls, and the cup spills
  if (TT >= CU.lunchDrop - 0.2) {
    const fall = EZ.i2(ev(CU.hit - 0.32, 0.32));
    if (fall < 1) { doodle('sandwich', CUP.cx, lerp(420, level - 30, fall), 0.9 * popS(CU.lunchDrop - 0.2), { key: 'lunchDrop' }); }
    else {
      const k = EZ.o3(ev(CU.hit, 0.6)), top = CUP.top - 30;
      ctx.save(); gclip(band(top, level + 2)); scribbleFill(band(top, level + 2), ACC, { key: 'over', gap: 10, w: 4.5, base: 0.4 }); ctx.restore();
      [[-1, 0], [1, 1]].forEach(([side, j]) => { const x = cupX(CUP.top, side); const P = [[x, CUP.top - 6], [x + side * 26, CUP.top + 40], [x + side * 18, CUP.top + 60 + 300 * k], [x + side * 6, CUP.top + 40]]; gfill(P, ACC, { a: 0.9, key: 'spill' + j }); gline(P, { w: 3, key: 'spo' + j, closed: true }); });
      for (let i = 0; i < 6; i++) { const R = RNG('splash', i), a = -Math.PI / 2 + R.n(1.1), d = 60 + 140 * k * R.r(0.6, 1); ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(CUP.cx + Math.cos(a) * d, CUP.top - 30 + Math.sin(a) * d * 0.7 + 80 * k * k, R.r(6, 12) * (1 - 0.4 * k), 0, TAU); ctx.fill(); }
      handLetter('Thursday', CUP.cx, CUP.top - 200, 84, { weight: 700, reveal: ev(CU.hit + 0.25, 0.4), key: 'thuLbl', col: SK.ink });
    }
  }
  // the cup itself (over its contents), pencil then ink
  const C = cupPts();
  gpencil(C, { w: 3, key: 'cupc', a: 0.6, part: cupK });
  gline(C, { w: 6, key: 'cup', part: ev(CU.cup, 0.5) });
  gline(loopPts(CUP.cx, CUP.top, CUP.wt / 2, 22, 0.04), { w: 5, key: 'rim', part: ev(CU.cup + 0.2, 0.4) });
  handLetter('Monash FODMAP · "Stack Cup"', CUP.cx, CUP.bot + 70, 36, { reveal: ev(CU.cup + 0.6, 0.6), key: 'src', col: SK.graph });
}

// ---- 3. Get Regular: meals, symptoms, bathroom trips and mood, day by day
const ROWSL = [['meals', 'plate', 'meals'], ['symptoms', 'storm', 'symptoms'], ['bathroom', 'roll', 'bathroom'], ['mood', 'mood', 'mood']];
const DAYS = 'MTWTFSS';
function sLog() {
  sketchPage({ grid: 'dots' });
  const g = { x: 250, y: 640, cw: 92, rh: 150 };
  DAYS.split('').forEach((d, c) => handLetter(d, g.x + c * g.cw + g.cw / 2, g.y - 24, 46, { weight: 700, key: 'day' + c, reveal: ev(TB.app + 0.1 + c * 0.04, 0.2), col: SK.graph }));
  // Thursday's column: highlighted when the pattern shows
  const hl = ev(CU.yours - 0.3, 0.5); if (hl > 0) highlight(g.x + 3 * g.cw + 8, g.x + 4 * g.cw - 8, g.y + 2 * g.rh, 4 * g.rh, hl, { key: 'thuCol', a: 0.45 });
  ROWSL.forEach(([cue, icon, name], r) => {
    const y = g.y + r * g.rh + g.rh / 2, t = CU[cue];
    doodle(icon, 140, y, icon === 'storm' ? 0.55 : 0.8, { key: 'row' + r, part: ev(t - 0.2, 0.4) });
    for (let c = 0; c < 7; c++) {
      const k = ev(t + c * 0.05, 0.25); if (k <= 0) continue;
      const R = RNG('mark', r, c), amt = [[0.4, 0.5, 0.3, 0.9, 0.4, 0.5, 0.4], [0.3, 0.3, 0.5, 0.9, 0.2, 0.3, 0.3], [0.2, 0.4, 0.6, 0.9, 0.5, 0.2, 0.2], [0.1, 0.1, 0.4, 0.9, 0.3, 0.1, 0.1]][r][c];
      const x = g.x + c * g.cw + g.cw / 2, bh = 100 * amt * k;
      const P = [[x - 24, y + 50], [x - 24, y + 50 - bh], [x + 24, y + 50 - bh], [x + 24, y + 50]];
      gfill(P, c === 3 ? ACC : SK.graphL, { a: c === 3 ? 0.9 : 0.5, off: [3, 3], key: 'bar' + r + c }); gline(P, { w: 3, key: 'bo' + r + c });
    }
    gpencil([[g.x, y + 52], [g.x + 7 * g.cw, y + 52]], { w: 2, key: 'base' + r, a: 0.6 });
  });
  // the logo, taped to the page
  const lg = ev(CU.logo - 0.1, 0.3); if (lg > 0) { ctx.save(); ctx.translate(520, 420); ctx.rotate(-0.03); ctx.scale(0.9 + 0.1 * lg, 0.9 + 0.1 * lg); const P = sketchBox(-230, -80, 460, 160, 8, 0.02); gfill(P, SK.sheet, { key: 'lgf', off: [6, 7] }); gline(P, { w: 3.5, key: 'lgo', closed: true }); drawAsset('logo-black.svg', -190, -60, 380, 120, { fit: 'contain' }); tapeStrip(-200, -78, 100, -0.35, 'lgt1', 34); tapeStrip(200, -78, 100, 0.35, 'lgt2', 34); ctx.restore(); }
}

// ---- 4. end card: notice what fills your cup; download
function sEnd() {
  sketchPage({ grid: 'dots' });
  ctx.save(); ctx.translate(540, 520); ctx.rotate(-0.02); const P = sketchBox(-260, -90, 520, 180, 8, 0.02); gfill(P, SK.sheet, { key: 'elf', off: [6, 7] }); gline(P, { w: 3.5, key: 'elo', closed: true }); drawAsset('logo-black.svg', -215, -68, 430, 136, { fit: 'contain' }); tapeStrip(-230, -88, 110, -0.35, 'elt1', 36); tapeStrip(230, -88, 110, 0.35, 'elt2', 36); ctx.restore();
  const [a0, a1] = handLetter('Notice what fills your cup.', 540, 800, 84, { weight: 700, reveal: ev(TB.end + 0.2, 0.9), key: 'tagE' });
  if (TT > TB.end + 1.1) highlight(a1 - fontW('cup.', `700 84px ${HAND}`) - 4, a1 - 10, 780, 46, ev(TB.end + 1.1, 0.3), { key: 'tagH' });
  // a small cup with three bands, and Maya waving it off
  const mini = { x: 320, y: 1040 };
  for (let i = 0; i < 3; i++) { const P = [[mini.x - 60 + i * 4, mini.y - i * 36], [mini.x + 60 - i * 4, mini.y - i * 36], [mini.x + 56 - i * 4, mini.y - i * 36 - 30], [mini.x - 56 + i * 4, mini.y - i * 36 - 30]]; gfill(P, ACC, { a: 0.85, key: 'mb' + i }); }
  gline([[mini.x - 70, mini.y - 130], [mini.x - 54, mini.y + 6], [mini.x + 54, mini.y + 6], [mini.x + 70, mini.y - 130]], { w: 5, key: 'minic' });
  maya(700, 1130, 0.7, { key: 'mayaE', mood: 'happy' });
  // the CTA: an inked button in the brand's face
  const cb = popS(VL('close').t1 + 0.4);
  if (cb > 0) { ctx.save(); ctx.translate(540, 1270); ctx.scale(cb, cb); const Bt = sketchBox(-300, -64, 600, 128, 60, 0.02); gfill(Bt, '#1E1A17', { a: 1, off: [6, 7], key: 'ctaf' }); gline(Bt, { w: 4, key: 'ctao', closed: true }); ctx.font = `700 44px ${SANS}`; ctx.fillStyle = SK.sheet; ctx.textAlign = 'center'; ctx.fillText('Download Get Regular', 0, -2); ctx.font = `500 30px ${SANS}`; ctx.fillStyle = '#CFC6B8'; ctx.fillText('Start logging today', 0, 38); ctx.restore(); }
  ctx.save(); ctx.font = `500 24px ${SANS}`; ctx.fillStyle = SK.graph; ctx.textAlign = 'center'; ctx.fillText('Educational only. Not medical advice.', 540, 1378); ctx.restore();
}
