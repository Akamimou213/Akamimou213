// motion.js — pure motion primitives for a draw(t) engine. Every function is a closed-form function of time:
// no state, no timers, so any frame renders on its own (parallel rendering, scrubbing, loops).
// Browser: injected by scripts/render.cjs as `window.Motion`. Node: require('./motion.js').
(function (root) {
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const inv = (a, b, x) => clamp((x - a) / (b - a));            // 0..1 progress of x through [a, b]

  // Timing bands (reference/craft.md): micro 120-240 ms, small element 320-480, card 560-880, scene change 800-1200,
  // camera move 1.6-3.6 s. Exits take 60-75 % of their entrance. Sibling staggers 50-120 ms, whole stagger <= 500 ms.
  // Enter from scale 0.90-0.97, never from 0. Longer travel takes longer (200 px ~1.3x, full frame ~1.8-2x a 50 px move).

  // Easings for things that are not springs (wipes, masks, counters). Springs for anything that "moves".
  const E = {
    linear: x => x,
    outCubic: x => 1 - Math.pow(1 - x, 3),
    inOutCubic: x => (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
    outExpo: x => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
    inOutExpo: x => (x <= 0 ? 0 : x >= 1 ? 1 : x < .5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2),
  };

  // Unit step response of a damped spring, mass 1. k=170, d=20 -> ~2 % overshoot, settles in ~0.45 s.
  // Stiffer/snappier: k 260-320, d 24-30. Lazy camera: k 90, d 19.
  function spring(t, k = 170, d = 20) {
    if (t <= 0) return 0;
    const w0 = Math.sqrt(k), z = d / (2 * w0);
    if (z >= 1) return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
    const wd = w0 * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + (z * w0 / wd) * Math.sin(wd * t));
  }

  // A value whose target changes several times: sum one spring per change. keys = [[t0, v0], [t1, v1], ...].
  // Never restart a tween from the current value: summing keeps velocity continuous through retargets.
  function track(t, keys, k = 170, d = 20) {
    let v = keys[0][1];
    for (let i = 1; i < keys.length; i++) v += (keys[i][1] - keys[i - 1][1]) * spring(t - keys[i][0], k, d);
    return v;
  }

  // Zoom / scale targets: spring in log space. A linear scale track reads as slowing down as it grows.
  const logTrack = (t, keys, k = 90, d = 19) => Math.exp(track(t, keys.map(([t0, v]) => [t0, Math.log(v)]), k, d));

  // Stretching tab indicator: leading edge on a stiff spring, trailing edge on a soft one -> [left, right].
  // stops = [[t, x], ...] for one edge; pass the other edge's stops separately if widths differ.
  function indicator(t, stops, stopsB = stops) {
    const lead = track(t, stops, 320, 30), trail = track(t, stopsB, 140, 22);
    return [Math.min(lead, trail), Math.max(lead, trail)];
  }

  // Content opacity inside a morphing container: enters 80 ms after the morph starts, leaves 100 ms before the next.
  const swapAlpha = (t, tIn, tOut) => Math.min(clamp((t - tIn - .08) / .12), clamp((tOut - .1 - t) / .1));

  // Seamless loop: map any t into [0, d). Design so draw(0) === draw(d).
  const loopT = (t, d) => ((t % d) + d) % d;

  // Index of the active key at t (keys sorted by .t or [t, ...]).
  const segOf = (t, keys) => { let i = 0; for (let j = 0; j < keys.length; j++) if (t >= (keys[j].t ?? keys[j][0])) i = j; return i; };

  // Deterministic randomness. rng(seed)() -> [0, 1). Never use Math.random in draw(t).
  function rng(seed = 1) {
    let s = seed >>> 0 || 1;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  }
  const hash = (i, seed = 0) => { let x = Math.imul(i ^ seed, 0x9E3779B1); x ^= x >>> 15; x = Math.imul(x, 0x85EBCA77); x ^= x >>> 13; return ((x >>> 0) % 100000) / 100000; };

  // Colour mix of two #rrggbb hexes -> 'rgb(...)'. Use for ink changes of one element, never black -> accent fades.
  function mixHex(a, b, t) {
    const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
    const A = p(a), B = p(b);
    return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp(t)))).join(',')})`;
  }

  // Colour mix in OKLab: perceptually even, no grey dip between saturated hues (blue -> yellow). Returns 'rgb(...)'.
  function mixOklab(a, b, t) {
    const toLin = c => (c /= 255) <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4, toSrgb = c => 255 * (c <= .0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - .055);
    const lab = h => {
      const [r, g, b] = [1, 3, 5].map(i => toLin(parseInt(h.slice(i, i + 2), 16)));
      const l = Math.cbrt(.4122214708 * r + .5363325363 * g + .0514459929 * b), m = Math.cbrt(.2119034982 * r + .6806995451 * g + .1073969566 * b), s = Math.cbrt(.0883024619 * r + .2817188376 * g + .6299787005 * b);
      return [.2104542553 * l + .793617785 * m - .0040720468 * s, 1.9779984951 * l - 2.428592205 * m + .4505937099 * s, .0259040371 * l + .7827717662 * m - .808675766 * s];
    };
    const A = lab(a), B = lab(b), [L, M, S] = A.map((v, i) => lerp(v, B[i], clamp(t)));
    const l = (L + .3963377774 * M + .2158037573 * S) ** 3, m = (L - .1055613458 * M - .0638541728 * S) ** 3, s = (L - .0894841775 * M - 1.291485548 * S) ** 3;
    const rgb = [4.0767416621 * l - 3.3077115913 * m + .2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - .3413193965 * s, -.0041960863 * l - .7034186147 * m + 1.707614701 * s];
    return `rgb(${rgb.map(c => Math.round(clamp(toSrgb(clamp(c)), 0, 255))).join(',')})`;
  }

  // Subframe sample times for motion blur at frame i. fast = [[t0, t1, n, shutter], ...] raises the sample count
  // on fast moves; hardCuts clamps samples so a shutter never straddles a cut (that makes a grey ghost frame).
  function subframeTimes(i, { fps = 60, sub = 6, shutter = .75, fast = [], hardCuts = [], dur = Infinity } = {}) {
    const t = i / fps;
    const f = fast.find(([a, b]) => t >= a - .02 && t < b);
    const n = f ? f[2] : sub, sh = (f ? f[3] : shutter) / fps;
    return Array.from({ length: n }, (_, k) => {
      let ts = Math.min(t + k * sh / n, dur - 1e-4);
      for (const c of hardCuts) if (t < c && ts >= c) ts = c - 1e-4;
      return ts;
    });
  }

  // Per-character stagger helper: progress of character j of a word entering at t0.
  const stagger = (t, t0, j, gap = .03, k = 260, d = 24) => spring(t - t0 - j * gap, k, d);

  const api = { clamp, lerp, inv, E, spring, track, logTrack, indicator, swapAlpha, loopT, segOf, rng, hash, mixHex, mixOklab, subframeTimes, stagger };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.Motion = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
