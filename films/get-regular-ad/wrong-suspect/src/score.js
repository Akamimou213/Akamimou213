  // =====================================================================
  //  SCORE BODY — runs inside buildScore() (kit/score-head.js). to = 'm' (music) or 's' (sfx). D major, warm and sparse.
  //  Arc: a quiet room and a two-note motif (dinner) -> a soft groove with rail clacks (the train) -> it thins (the plate)
  //  -> a hard stop, near-silence under "One day can't show you a delay" -> THE LOUDEST HIT when the gold line connects
  //  -> a flat warm chord under Get Regular, pops on its words -> the motif again, resolved (end).
  //  The voice sits on top at piece.json "voice".music dB; review judges the arc on the score alone.
  // =====================================================================
  const T = TIMELINE, cu = T.cues, R = RNG('score');
  const each = (t0, t1, step, fn) => { for (let k = 0; t0 + k * step < t1 - 1e-6; k++) fn(t0 + k * step, k); };
  const MOTIF = [['A4', 0], ['D5', 0.32]];                                   // "noticing": a rising fourth
  const motif = (t, vel, notes = MOTIF) => notes.forEach(([n, dt], i) => pluck(t + dt, nz(n), vel, -0.1 + i * 0.2, 0.7, 2400, 0.4));
  const SILENT0 = VL('cut').t1 + 0.35;                                       // everything musical ends before this
  const ARP = ['D4', 'A4', 'Fs4', 'A4', 'B3', 'Fs4', 'D4', 'Fs4', 'G3', 'D4', 'B3', 'D4', 'A3', 'E4', 'Cs4', 'E4'];

  // ================= MUSIC =================
  to = 'm';
  // dinner: a soft room, the motif when the stamp lands
  pad(0.0, TB.track + 0.4, ['D3', 'A3', 'Fs4'], 0.03, { type: 'triangle', cut: 750, att: 0.6, rel: 0.4, send: 0.5 });
  motif(0.35, 0.09);
  // the train: plucked 8ths and a bass, building gently until "caught"
  pad(TB.track - 0.2, TB.plate + 0.3, ['D3', 'A3', 'E4'], 0.03, { cut: 950, att: 0.5, rel: 0.4, send: 0.35 });
  each(TB.track, TB.plate, E8, (t, k) => {
    const busy = t > cu.train ? 1 : 0.6, acc = k % 4 === 0 ? 1.2 : k % 2 ? 0.7 : 0.9;
    if (k % 2 === 0 || t > cu.train) pluck(t, nz(ARP[k % 16]), 0.05 * acc * busy, Math.sin(k * 0.8) * 0.3, 0.32, 2800, 0.2);
    if (k % 4 === 0) bass(t, nz(['D2', 'B1', 'G1', 'A1'][Math.floor(k / 8) % 4]), 0.12 * busy);
  });
  // the plate: only the pad, thinning; dry and stopped dead before the hush
  pad(TB.plate - 0.2, SILENT0, ['B2', 'Fs3', 'D4'], 0.026, { type: 'triangle', cut: 650, att: 0.4, rel: 0.25, send: 0.15 });
  each(TB.plate + 0.2, SILENT0 - 0.6, BEAT * 2, (t, k) => pluck(t, nz(['Fs4', 'D4', 'B3', 'A3'][k % 4]), 0.035, 0.2 - k * 0.1, 0.5, 1800, 0.1));
  // THE HIT: a stab and a sub when the gold line connects, then a flat warm chord (no swell)
  ['D3', 'A3', 'D4', 'Fs4', 'A4', 'D5'].forEach((n, i) => pluck(cu.hit + i * 0.006, nz(n), 0.34, (i - 2.5) * 0.15, 0.8, 5200, 0.4));
  pad(cu.hit, cu.hit + 0.45, ['D3', 'A3', 'D4', 'Fs4', 'A4', 'D5'], 0.42, { cut: 3600, att: 0.008, rel: 0.38, send: 0.3 });
  pad(cu.hit + 0.35, TB.end + 0.5, ['D3', 'A3', 'D4', 'Fs4', 'A4'], 0.05, { cut: 1300, att: 0.4, rel: 0.5, send: 0.5 });
  drone(cu.hit + 0.35, TB.end + 0.5, nz('D2'), 0.05, { att: 0.3, rel: 0.5 });
  each(cu.logo, TB.end, BEAT, (t, k) => { if (k % 2 === 0) pluck(t, nz(['D5', 'A4', 'B4', 'A4'][(k / 2) % 4]), 0.03, Math.sin(k) * 0.3, 0.5, 2600, 0.35); });
  // end: the motif again, resolved down to the tonic, then a long fade
  pad(TB.end - 0.1, T.duration - 0.25, ['D3', 'A3', 'Fs4'], 0.035, { type: 'triangle', cut: 800, att: 0.5, rel: 1.6, send: 0.5 });
  motif(cu.close + 0.2, 0.09, [['A4', 0], ['D5', 0.32], ['Fs5', 0.64], ['D5', 1.3]]);

  // ================= SFX =================
  to = 's';
  // the stamp on the plate, and again (softer) on the carriage
  noiseHit(cu.stamp - 0.03, 0.09, 'lowpass', 900, 0.8, 0.32); sub(cu.stamp - 0.02, 0.16);
  noiseHit(cu.caught - 0.03, 0.08, 'lowpass', 900, 0.8, 0.2); sub(cu.caught - 0.02, 0.08);
  // the clock races on "delay"
  each(cu.clock, cu.clock + 1.4, 0.07, (t, k) => noiseHit(t, 0.012, 'highpass', 5200 + (k % 2) * 900, 1.2, 0.03 * (1 - k / 22), 0.4));
  // paper swishes into each morph
  T.morphs.forEach((tc) => sweep(tc - 0.42, tc + 0.02, 0.012, 450, 2600, 0));
  // rail clacks while the dinner carriage travels; the counter ticks every 2 hours
  each(cu.travel0, cu.travel1, 0.25, (t, k) => noiseHit(t, 0.03, 'bandpass', k % 2 ? 1500 : 1100, 3, 0.05, -0.2 + 0.4 * Math.sin(k * 0.3)));
  for (let h = 2; h <= 29; h += 2) { const u = h / 29, t = cu.travel0 + (cu.travel1 - cu.travel0) * (u < 0.5 ? Math.cbrt(u / 4) : 1 - Math.cbrt((1 - u) / 4)); blip(t, 1900, 1700, 0.04, 0.02, 0.3); }
  // the train arrives (three pops), the new meal rolls in, the coupling clunk
  [0, 1, 2].forEach((i) => blip(cu.train + i * 0.12, 600 + i * 180, 900 + i * 180, 0.07, 0.05, -0.3 + i * 0.3));
  each(cu.newMeal - 0.2, cu.newMeal + 0.5, 0.18, (t) => noiseHit(t, 0.03, 'bandpass', 1300, 3, 0.04, -0.4));
  noiseHit(cu.shove - 0.02, 0.14, 'lowpass', 600, 0.9, 0.3, -0.2); sub(cu.shove - 0.02, 0.1);
  // two marker squeaks
  [cu.lunch, cu.yesterday].forEach((t, i) => sweep(t - 0.02, t + 0.4, 0.016, 2600 + i * 400, 3800 + i * 400, -0.3 + i * 0.6));
  // paper tears as the foods leave the plate; a soft whoosh as it shrinks
  [cu.cut + 0.15, cu.nothing - 0.25, cu.nothing + 0.15, cu.nothing + 0.5, cu.smaller - 0.45].forEach((t, i) => sweep(t - 0.02, t + 0.22, 0.03, 1800 + i * 200, 5000, i % 2 ? 0.4 : -0.4));
  sweep(cu.smaller - 0.1, cu.smaller + 0.35, 0.02, 2400, 400, 0);
  // the weeks fan out: paper flicks, rising
  each(cu.fan + 0.05, cu.fan + 0.05 + 21 * 0.022, 0.044, (t, k) => blip(t, 900 + k * 60, 1100 + k * 60, 0.03, 0.022, -0.5 + k / 10));
  // the gold line draws on: a chime that shares the chord
  chime(cu.hit + 0.02, [nz('D6'), nz('A6'), nz('Fs6')], 0.05);
  // pops on Get Regular's words, the day-by-day sweep, the pattern pulse
  [cu.logo, cu.meals, cu.symptoms, cu.bathroom].forEach((t, i) => blip(t, 700 + i * 150, 1050 + i * 150, 0.08, 0.05, -0.3 + i * 0.2));
  each(cu.daybyday, cu.daybyday + 1.4, 0.2, (t, k) => noiseHit(t, 0.02, 'highpass', 4200, 1, 0.022, -0.6 + k * 0.2));
  chime(cu.pattern, [nz('A5'), nz('D6')], 0.03, 0.2);
