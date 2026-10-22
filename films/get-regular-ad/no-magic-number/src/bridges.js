// ERAS, CAMERAS, BRIDGES — read by kit/morph.js. Each era change is a shape morph in a pause of the voice.
const ERA_BG = [GR.wall, GR.cream, GR.wall, GR.wall, GR.dark];
function pieceCam(era, t) {
  if (era === 0) return push(t, 0, TB.range - 0.6, { z: 1.07, p: [600, 760], to: [560, 760] });
  return null;
}
const BRIDGES = [
  { tc: TB.range, d: 0.5, A: () => ({ P: rect(STICKY.x, STICKY.y, STICKY.w, STICKY.h, 4), c: GR.butter }), B: () => ({ P: rect(NX(0) - 20, LINE_Y, NX(21) - NX(0) + 40, 22, 11), c: GR.taupe }) },
  { tc: TB.two, d: 0.5, A: () => ({ P: rect(NX(0) - 20, LINE_Y, NX(21) - NX(0) + 40, 22, 11), c: GR.taupe }), B: () => ({ P: rect(60, ROWS[0].y - 250, 880, 380, 18), c: GR.paper }) },
  { tc: TB.weeks, d: 0.5, A: () => ({ P: rect(60, ROWS[1].y - 250, 880, 380, 18), c: GR.paper }), B: () => ({ P: rect(70, 560, 880, 700, 18), c: GR.paper }) },
  { tc: TB.end, d: 0.5, A: () => ({ P: rect(70, 560, 880, 700, 18), c: GR.paper }), B: () => ({ P: rect(160, 560, 760, 820, 24), c: GR.dark }) },
];
