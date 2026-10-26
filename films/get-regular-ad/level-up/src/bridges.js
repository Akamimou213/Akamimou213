// ERAS, CAMERAS, BRIDGES — read by kit/morph.js. Hard cuts in the pauses (the reference's grammar); one morph:
// the word "knowing" becomes the end card.
const ERA_BG = [GR.cream, GR.wall, GR.butter, GR.cream, GR.wall, GR.cream, '#3D452C'];
function pieceCam(era, t) {
  if (era === 0) return push(t, 0, TB.doc, { z: 1.06, p: [520, 900], to: [520, 900] });
  if (era === 2) return bump(t, CU.hit, [540, 700], 0.06, 0.5);
  return null;
}
const BRIDGES = [
  { tc: TB.end, d: 0.5, A: () => ({ P: rect(240, 1040, 600, 140, 20), c: GR.dusk }), B: () => ({ P: rect(160, 460, 760, 900, 24), c: '#3D452C' }) },
];
