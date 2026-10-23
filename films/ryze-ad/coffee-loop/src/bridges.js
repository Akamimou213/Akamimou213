// ERAS, CAMERAS, BRIDGES — v2: no shape morphs. Every seam is a hard cut mid-motion with matched vectors:
//   receipt -> clock   zoom-through (Z +, into the "0" of 16:00)       clock -> pile   inverse zoom (Z -, arrival)
//   pile -> fix        zoom-through (Z +, into the top receipt)        fix -> end      rise (UP: the conclusion)
const ERA_BG = [GR.wall, GR.wall2, GR.wall, GR.cream, GR.cream];
const CAMS = [camReceipt, camClock, camAgain, camFix, camEnd];
function pieceCam(era) { return CAMS[era](); }
const BRIDGES = [];
