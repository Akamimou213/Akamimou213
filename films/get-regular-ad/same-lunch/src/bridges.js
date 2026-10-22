// ERAS, CAMERAS, BRIDGES — read by kit/morph.js. Morphs happen on the bare page (graphite windows).
const ERA_BG = [SK.paper, SK.paper, SK.paper, SK.paper];
function pieceCam(era, t) {
  if (era === 1) return push(t, CU.lunchDrop - 0.4, HIT + 0.3, { z: 1.04, p: [CUP.cx, 820], to: [CUP.cx, 830] }, TB.app - 1.2, TB.app - 0.5);
  return null;
}
const BRIDGES = [
  { tc: TB.cup, d: 0.5, A: () => ({ P: [[700, 1048], [820, 1048], [700, 958]], c: SK.wood }), B: () => ({ P: cupPts(), c: SK.sheet }) },
  { tc: TB.app, d: 0.5, A: () => ({ P: cupPts(), c: SK.terra }), B: () => ({ P: sketchBox(250, 640, 644, 600, 10, 0), c: SK.sheet }) },
  { tc: TB.end, d: 0.5, A: () => ({ P: sketchBox(250, 640, 644, 600, 10, 0), c: SK.sheet }), B: () => ({ P: sketchBox(280, 430, 520, 180, 8, 0), c: SK.sheet }) },
];
