// ERAS, CAMERAS, BRIDGES — read by kit/morph.js. Each era change is a shape morph in a pause of the voice.
const ERA_BG = [GR.wall, GR.wall2, GR.wall, GR.cream, GR.cream];
function pieceCam(era, t) {
  if (era === 0) return push(t, CU.stamp - 0.4, HIT + 0.4, { z: 1.08, p: [RC.x + 200, RC.top + 300 + 2 * RC.lh], to: [RC.x + 220, RC.top + 340 + 2 * RC.lh] });
  return null;
}
const BRIDGES = [
  { tc: TB.clock, d: 0.5, A: () => ({ P: rect(RC.x, RC.top, RC.w, 760, 4), c: GR.paper }), B: () => ({ P: ellipsePts(CK.x, CK.y, CK.r + 30, CK.r + 30, 0, 64), c: GR.brown }) },
  { tc: TB.again, d: 0.5, A: () => ({ P: ellipsePts(CK.x, CK.y, CK.r + 30, CK.r + 30, 0, 64), c: GR.brown }), B: () => ({ P: rect(350, 530, 300, 460, 4), c: GR.paper }) },
  { tc: TB.fix, d: 0.5, A: () => ({ P: rect(350, 530, 300, 460, 4), c: GR.paper }), B: () => ({ P: rect(40, 358, 512, 600, 4), c: GR.paper }) },
  { tc: TB.end, d: 0.5, A: () => ({ P: rect(670, 685, 260, 390, 6), c: GR.paper }), B: () => ({ P: rect(370, 505, 340, 510, 6), c: GR.paper }) },
];
