// =====================================================================
//  SCENES — No Magic Number. One function per era, world coords 1080x1920, cued from the voice.
// =====================================================================
const CU = TIMELINE.cues;
const STICKY = { x: 640, y: 560, w: 300, h: 240 };                  // the "once a day?" sticky note
const NX = (v) => 120 + v * 36;                                   // the number line: bowel movements a week, 0..21
const LINE_Y = 1100;

function sticky(x, y, w, h, o = {}) {   // a butter-yellow sticky note with a serif question; tears in two on "magic"
  const tear = o.tear ?? 0, k = o.key ?? 'note';
  const half = (side) => {
    ctx.save();
    const dx = side * tear * 260, dy = tear * tear * 900, rr = side * tear * 0.9;
    ctx.translate(x + w / 2 + dx, y + h / 2 + dy); ctx.rotate((o.rot ?? -0.04) + rr); ctx.translate(-w / 2, -h / 2);
    if (tear > 0) { ctx.beginPath(); side < 0 ? ctx.rect(-20, -20, w / 2 + 20 + 6 * Math.sin(1), h + 40) : ctx.rect(w / 2, -20, w / 2 + 20, h + 40); ctx.clip(); }
    cut(rect(0, 0, w, h, 4), GR.butter, { key: k, sb: 10, sy: 7, tear: 1.2 });
    cut(rect(w / 2 - 50, -14, 100, 30, 2), 'rgba(240,230,190,0.8)', { key: k + 'tape', shadow: false, grain: 0.3, shade: false });
    serif('once', w / 2, h * 0.44, 64, GR.ink, { key: k + 'a' });
    serif('a day?', w / 2, h * 0.78, 64, GR.ink, { key: k + 'b' });
    ctx.restore();
  };
  if (tear <= 0) half(0); else { half(-1); half(1); }
}

// ---- 1. a morning: how often should you poop? once a day?
function sMorning() {
  wall(GR.wall, { key: 'wallM', pat: pat.stripes('rgba(255,255,255,0.2)', 26, 86) });
  windowLight({ a: 0.28, ang: -0.5 });
  // the window at sunrise, the fridge with the note, a wall calendar
  cut(rect(80, 340, 330, 400, 6), GR.woodL, { key: 'winM' });
  cut(rect(102, 362, 286, 356, 2), '#F2D7B8', { key: 'skyM', shadow: false, pat: pat.stripes('rgba(255,255,255,0.18)', 30, 70, 0) });
  cut(ellipsePts(250, 640, 70, 70, 0, 30), '#F6C987', { key: 'sunM', crayon: '#E9B26C', crAl: 0.3 });
  cut(rect(102, 640, 286, 78, 2), GR.sageD, { key: 'hillM', shadow: false, tear: 2 });
  cut(rect(242, 362, 8, 356, 0), GR.woodL, { key: 'mullM', shadow: false });
  cut(rect(60, 720, 370, 28, 4), GR.wood, { key: 'sillM' });
  plant(150, 712, 0.55, GR.terra, 'plantM');
  cut(rect(560, 300, 440, 860, 26), '#F4F1EA', { key: 'fridge', sb: 14, sy: 8 });
  cut(rect(560, 660, 440, 10, 2), '#D8D2C7', { key: 'fridgeLine', shadow: false });
  cut(rect(950, 420, 18, 160, 8), '#C9C2B6', { key: 'handle1', sb: 4, sy: 2 });
  cut(ellipsePts(620, 360, 16, 16, 0, 14), GR.terra, { key: 'magnet1', sb: 4, sy: 2 });
  cut(ellipsePts(940, 760, 16, 16, 0, 14), GR.sage, { key: 'magnet2', sb: 4, sy: 2 });
  if (TT >= CU.once - 0.1) sticky(STICKY.x, STICKY.y, STICKY.w, STICKY.h, { s: 1 });
  // the person with a morning mug, a "?" above
  woman(330, 1150, 1.3, { key: 'mp', shirt: GR.dusk, skin: '#C98E6B', hair: '#2A211C', mood: TT >= CU.once ? 'wow' : 'smile', shirtPat: pat.dots('rgba(255,255,255,0.14)', 3, 22) });
  mug(470, 1120, 1.0, GR.sand, 'mugM');
  const q = popS(CU.often);
  if (q > 0) { ctx.save(); ctx.translate(470, 640); ctx.scale(q, q); ctx.rotate(Math.sin(TT * 3) * 0.05); serif('?', 0, 40, 220, GR.ink, { key: 'qm' }); ctx.restore(); }
  cut(rect(-40, 1240, W + 80, 900, 0), GR.woodL, { key: 'counterM', tear: 0, pat: pat.grainWood('rgba(110,70,40,0.14)'), sy: -6 });
  cut(rect(-40, 1240, W + 80, 26, 0), GR.wood, { key: 'edgeM', tear: 0.5, shadow: false });
  [0, 1, 2].forEach((i) => { const P = []; for (let k = 0; k <= 8; k++) P.push([450 + i * 20 + Math.sin(k * 0.9 + i + TT * 4) * 7, 1100 - k * 10]); ink(P, { w: 4, color: 'rgba(255,255,255,0.75)', amt: 0.6, key: 'stM' + i }); });
}

// ---- 2. the survey: normal runs from 3 a week to 3 a day
const CROWD = (() => { const R = RNG('crowd'), out = [], cols = {}; for (let i = 0; i < 40; i++) { const v = Math.round(3 + R.f() * 18), n = (cols[v] = (cols[v] ?? 0) + 1); if (n > 4) { i--; continue; } out.push({ v, n, skin: [GR.skin, '#C98E6B', '#8E5E40', '#EBC2A0'][(R.f() * 4) | 0], c: [GR.sage, GR.dusk, GR.terra, GR.sand, GR.blush, GR.sageD][(R.f() * 6) | 0] }); } return out; })();
function tinyPerson(x, y, s, skin, c, key) {
  cut(rect(x - 20 * s, y - 52 * s, 40 * s, 52 * s, 16 * s), c, { key: key + 'b', sb: 4, sy: 3, grain: 0.4 });
  cut(ellipsePts(x, y - 70 * s, 17 * s, 17 * s, 0, 16), skin, { key: key + 'h', sb: 3, sy: 2, grain: 0.3 });
}
function sRange() {
  wall(GR.cream, { key: 'wallR', pat: pat.dots('rgba(160,135,105,0.10)', 3, 46) });
  windowLight({ a: 0.18, vig: 0.12 });
  // the number line
  cut(rect(NX(0) - 20, LINE_Y, NX(21) - NX(0) + 40, 22, 11), GR.taupe, { key: 'axis', sb: 6, sy: 4 });
  [0, 3, 7, 14, 21].forEach((v) => { cut(rect(NX(v) - 3, LINE_Y + 18, 6, 24, 2), GR.taupe, { key: 'tk' + v, shadow: false }); sans(String(v), NX(v), LINE_Y + 80, 34, GR.inkSoft, { weight: 700 }); });
  sans('bowel movements a week', 500, LINE_Y + 136, 30, GR.inkSoft, { weight: 500 });
  // the crowd arrives across the range
  CROWD.forEach((p, i) => { const s = popS(CU.crowd + 0.1 + i * 0.03); if (s <= 0) return; ctx.save(); ctx.translate(NX(p.v), LINE_Y - 4 - (p.n - 1) * 92); ctx.scale(s, s); tinyPerson(0, 0, 1, p.skin, p.c, 'cp' + i); ctx.restore(); });
  // the two ends, then the bracket
  label('3 a week', NX(3), 600, 46, { s: popS(CU.aweek - 0.15), rot: -0.03 });
  label('3 a day', NX(21) - 30, 600, 46, { s: popS(CU.aday - 0.15), rot: 0.03 });
  const br = EZ.o2(ev(CU.aweek + 0.2, 0.6));
  if (br > 0) ink([[NX(3), 680], [NX(3), 650], [NX(21), 650], [NX(21), 680]].map((p, i, A) => p), { w: 6, color: GR.ink, amt: 0.6, key: 'bracket', frac: br });
  sans('95.9% of US adults with normal habits · NHANES, Mitsuhashi et al., Am J Gastroenterol 2018', 500, 470, 22, GR.inkSoft, { weight: 500 });
  // "there's no magic number": the once-a-day note comes back and tears
  const back = springEase(TT - (CU.magic - 0.9), 150, 18);
  if (TT >= CU.magic - 0.9) sticky(lerp(1200, 390, back), 760, 300, 240, { tear: EZ.i2(ev(CU.magic + 0.1, 0.7)), key: 'noteR', rot: -0.06 });
}

// ---- 3. your normal: the same week of three, for two people
const ROWS = [{ y: 700, band: [2, 4], skin: '#C98E6B', shirt: GR.dusk, hair: '#2A211C', note: 'usual: about 3 a week' },
              { y: 1170, band: [12, 16], skin: GR.skin, shirt: GR.sage, hair: '#7A4E35', note: 'usual: about 2 a day' }];
const MX = (v) => 400 + v * 24;                                   // the mini lines: 0..21 a week from x 400 to 904
function sTwo() {
  wall(GR.wall, { key: 'wallT', pat: pat.lines('rgba(160,135,105,0.10)', 44) });
  windowLight({ a: 0.2, vig: 0.12 });
  ROWS.forEach((r, i) => {
    cut(rect(60, r.y - 250, 880, 380, 18), GR.paper, { key: 'rowcard' + i, sb: 12, sy: 7 });
    woman(200, r.y + 40, 0.82, { key: 'tp' + i, shirt: r.shirt, skin: r.skin, hair: r.hair, mood: i === 1 && TT >= CU.change ? 'wow' : 'smile' });
    // the line, their gold band ("your normal"), its label
    cut(rect(MX(0), r.y, MX(21) - MX(0), 14, 7), GR.taupe, { key: 'ml' + i, sb: 3, sy: 2 });
    [0, 7, 14, 21].forEach((v) => sans(String(v), MX(v), r.y + 52, 26, GR.inkSoft, { weight: 700 }));
    const g = EZ.o2(ev(CU.yours + 0.15 + i * 0.25, 0.5));
    if (g > 0) { const x0 = MX(r.band[0]), x1 = lerp(x0, MX(r.band[1]), g); cut(rect(x0, r.y - 26, Math.max(4, x1 - x0), 66, 18), 'rgba(176,134,76,0.55)', { key: 'band' + i, shadow: false, tear: 0.6, grain: 0.4 }); serif(r.note, (MX(r.band[0]) + MX(r.band[1])) / 2 + (i ? -40 : 90), r.y - 78, 40, GR.gold, { key: 'bn' + i, frac: g }); }
    // this week: three. It drops onto both lines
    const d = springEase(TT - CU.three - i * 0.12, 160, 14);
    if (TT >= CU.three) { cut(ellipsePts(MX(3), lerp(r.y - 260, r.y + 7, d), 22, 22, 0, 18), GR.ink, { key: 'dot' + i, sb: 5, sy: 3 }); sans('this week: 3', MX(3) + 6, r.y + 104, 28, GR.ink, { weight: 700, align: 'left' }); }
  });
  // normal for one, a big change for the other
  const ok = popS(CU.normal); if (ok > 0) { ctx.save(); ctx.translate(MX(3) + 52, ROWS[0].y - 26); ctx.scale(ok, ok); ink([[-14, 0], [-3, 12], [18, -16]], { w: 8, color: GR.sageD, amt: 0.3, key: 'tick' }); ctx.restore(); }
  markerCircle(MX(3), ROWS[1].y + 7, 56, 48, EZ.o2(ev(CU.change - 0.1, 0.45)), 'mcC');
  label('a big change', MX(3) + 190, ROWS[1].y - 70, 40, { s: popS(CU.change + 0.2), rot: -0.03 });
}

// ---- 4. twelve weeks: you can't spot a change in a pattern you've never seen; then the gold band
const WEEKS = [7, 8, 6, 9, 7, 8, 7, 6, 8, 3, 2, 3];
const WX = (w) => 140 + w * 66, WY = (v) => 1150 - v * 44;
function sWeeks() {
  wall(GR.wall, { key: 'wallW', pat: pat.lines('rgba(160,135,105,0.10)', 44) });
  windowLight({ a: 0.2, vig: 0.12 });
  cut(rect(70, 560, 880, 700, 18), GR.paper, { key: 'chart', sb: 12, sy: 7 });
  sans('a week', 120, 640, 26, GR.inkSoft, { weight: 700, align: 'left' });
  [0, 5, 10].forEach((v) => { sans(String(v), 112, WY(v) + 9, 24, GR.inkSoft, { weight: 700, align: 'right' }); ink([[130, WY(v)], [900, WY(v)]], { w: 1.5, color: 'rgba(140,126,110,0.35)', amt: 0.3, key: 'grid' + v }); });
  sans('weeks', 520, 1225, 26, GR.inkSoft, { weight: 700 });
  // THE PAYOFF: the band of your normal draws behind the dots
  const b = EZ.o2(ev(CU.hit - 0.05, 0.5));
  if (b > 0) {
    const x0 = WX(0) - 30, x1 = lerp(x0, WX(8) + 30, b);
    cut(rect(x0, WY(9.6), x1 - x0, WY(5.4) - WY(9.6), 24), 'rgba(176,134,76,0.42)', { key: 'normalBand', shadow: false, tear: 0.6, grain: 0.4 });
    ink([[x0, WY(9.6)], [x1, WY(9.6)]], { w: 5, color: GR.gold, amt: 0.6, key: 'bandTop' });
    ink([[x0, WY(5.4)], [x1, WY(5.4)]], { w: 5, color: GR.gold, amt: 0.6, key: 'bandBot' });
    serif('your normal', (x0 + WX(8) + 30) / 2, WY(9.6) - 26, 52, GR.gold, { key: 'yn', frac: EZ.o2(ev(CU.hit + 0.3, 0.6)) });
  }
  // the dots arrive one week at a time
  WEEKS.forEach((v, w) => { const s = popS(CU.dots + 0.15 + w * 0.22); if (s <= 0) return; const out = w >= 9 && TT >= CU.hit; cut(ellipsePts(WX(w), WY(v), 20 * s, 20 * s, 0, 18), out ? GR.terra : GR.ink, { key: 'wk' + w, sb: 4, sy: 3 }); });
  const pulse = 1 + 0.12 * Math.sin(Math.PI * ev(CU.stands, 0.5));
  markerCircle(WX(10), WY(2.7), 130 * pulse, 70 * pulse, EZ.o2(ev(CU.hit + 0.5, 0.5)), 'mcW');
  label('a change', WX(10), WY(2.7) + 112, 44, { s: popS(CU.hit + 0.8), rot: 0.03 });
  // Get Regular
  if (TT >= CU.logo) { const s = popS(CU.logo); ctx.save(); ctx.translate(510, 430); ctx.scale(s, s); cut(rect(-250, -86, 500, 172, 8), GR.paper, { key: 'logoCard', sb: 10, sy: 6 }); drawAsset('logo-black.svg', -200, -66, 400, 136, { fit: 'contain' }); ctx.restore(); }
}

// ---- 5. end card: know your normal
function sEnd() {
  cut(rect(-40, -40, W + 80, H + 80, 0), GR.dark, { key: 'wallE', shadow: false, tear: 0, shade: false, grain: 0.5 });
  windowLight({ a: 0.06, vig: 0.3 });
  drawAsset('logo-white.svg', 540 - 270, 640, 540, 184, { fit: 'contain' });
  serif('Know your normal.', 540, 950, 88, GR.cream, { key: 'tagE', frac: EZ.o2(ev(TB.end + 0.3, 0.9)) });
  const g = EZ.o2(ev(CU.close + 0.4, 0.8));
  if (g > 0) { cut(rect(300, 1040, 480 * g, 60, 20), 'rgba(176,134,76,0.5)', { key: 'endBand', shadow: false, tear: 0.6, grain: 0.4 }); [0, 1, 2, 3, 4, 5].forEach((i) => { if (i / 6 < g) dot(330 + i * 82, 1070 + Math.sin(i * 1.7) * 10, 11, GR.cream); }); }
  sans('Blood, black stool, weight loss or a lasting change? See a doctor.', 520, 1210, 26, '#B9AFA3', { weight: 500 });
  sans('Educational only. Not medical advice.', 520, 1256, 26, '#9C9389', { weight: 500 });
}
