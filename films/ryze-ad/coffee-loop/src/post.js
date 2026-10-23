// =====================================================================
//  POST — runs after kit/morph.js: keep the exact (sub-frame) time for the camera and things in flight, so
//  `export.mjs --blur N` gives them real motion blur while the paper still boils on 2s.
// =====================================================================
{ const rf = window.renderFrame; window.renderFrame = (t, c, sub) => { EXACT_T = t; try { return rf(t, c, sub); } finally { EXACT_T = null; } }; }
