// =====================================================================
//  ERAS, CAMERAS, BRIDGES — read by kit/morph.js. Every era change is a shape morph in a pause of the voice:
//  the plate becomes the carriage, the oldest carriage becomes the plate, the shrunk plate becomes one day,
//  a day card becomes the end card.
// =====================================================================
const ERA_BG = [GR.wall, GR.cream, GR.woodL, GR.wall, GR.dark];
function pieceCam(era, t) {
  if (era === 0) return push(t, 0, TB.track - 0.6, { z: 1.06, p: [540, 1100], to: [540, 1100] });   // a slow push toward the plate
  return null;
}
const BRIDGES = [
  { tc: TB.track, d: 0.5, A: () => ({ P: ellipsePts(PLATE0.x, PLATE0.y, PLATE0.rx, PLATE0.ry, 0, 64), c: '#FBF9F4' }),
    B: () => { const [x, y] = trackAt(-0.02); return { P: carBody(x, y), c: GR.terra }; } },
  { tc: TB.plate, d: 0.5, A: () => { const [x, y] = trackAt(CARS[0].f + SHOVE); return { P: carBody(x, y), c: GR.dusk }; },
    B: () => ({ P: ellipsePts(540, 970, 330, 330, 0, 64), c: '#FBF9F4' }) },
  { tc: TB.days, d: 0.5, A: () => ({ P: ellipsePts(540, 970, 140, 140, 0, 64), c: '#FBF9F4' }),
    B: () => ({ P: rect(BIG.x, BIG.y, BIG.w, BIG.h, 10), c: GR.paper }) },
  { tc: TB.end, d: 0.5, A: () => { const S = slot(HERO); return { P: rect(S.x, S.y, S.w, S.h, 10), c: GR.paper }; },
    B: () => ({ P: rect(160, 560, 760, 820, 24), c: GR.dark }) },
];
