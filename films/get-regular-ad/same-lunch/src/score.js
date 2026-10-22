  // =====================================================================
  //  SCORE BODY — Same Lunch, Different Day. The series' D-major motif, lighter: pencil scratches, plops as the cup fills
  //  (each a step higher), a hush, THE LOUDEST HIT when it spills, a warm chord under Get Regular, the motif resolved.
  // =====================================================================
  const T = TIMELINE, cu = T.cues;
  const each = (t0, t1, step, fn) => { for (let k = 0; t0 + k * step < t1 - 1e-6; k++) fn(t0 + k * step, k); };
  const motif = (t, vel, notes = [['A4', 0], ['D5', 0.32]]) => notes.forEach(([n, dt], i) => pluck(t + dt, nz(n), vel, -0.1 + i * 0.2, 0.7, 2400, 0.4));
  const ARP = ['D4', 'A4', 'Fs4', 'A4', 'B3', 'Fs4', 'D4', 'Fs4', 'G3', 'D4', 'B3', 'D4', 'A3', 'E4', 'Cs4', 'E4'];
  const SILENT0 = VL('spill').t1 - 0.1;

  // ================= MUSIC =================
  to = 'm';
  pad(0.0, TB.cup + 0.3, ['D3', 'A3', 'Fs4'], 0.03, { type: 'triangle', cut: 800, att: 0.5, rel: 0.3, send: 0.5 });
  motif(0.25, 0.09);
  pad(TB.cup - 0.1, SILENT0, ['D3', 'A3', 'E4'], 0.028, { cut: 950, att: 0.5, rel: 0.25, send: 0.35 });
  each(TB.cup, SILENT0 - 0.4, E8, (t, k) => { const acc = k % 4 === 0 ? 1.15 : k % 2 ? 0.7 : 0.9; if (k % 2 === 0 || t > cu.night) pluck(t, nz(ARP[k % 16]), 0.042 * acc, Math.sin(k * 0.8) * 0.3, 0.3, 2800, 0.2); if (k % 4 === 0) bass(t, nz(['D2', 'B1', 'G1', 'A1'][Math.floor(k / 8) % 4]), 0.11); });
  ['D3', 'A3', 'D4', 'Fs4', 'A4', 'D5'].forEach((n, i) => pluck(cu.hit + i * 0.006, nz(n), 0.34, (i - 2.5) * 0.15, 0.8, 5200, 0.4));
  pad(cu.hit, cu.hit + 0.45, ['D3', 'A3', 'D4', 'Fs4', 'A4', 'D5'], 0.42, { cut: 3600, att: 0.008, rel: 0.38, send: 0.3 });
  pad(cu.hit + 0.35, TB.end + 0.5, ['D3', 'A3', 'D4', 'Fs4', 'A4'], 0.05, { cut: 1300, att: 0.4, rel: 0.5, send: 0.5 });
  drone(cu.hit + 0.35, TB.end + 0.5, nz('D2'), 0.05, { att: 0.3, rel: 0.5 });
  each(cu.logo, TB.end, BEAT, (t, k) => { if (k % 2 === 0) pluck(t, nz(['D5', 'A4', 'B4', 'A4'][(k / 2) % 4]), 0.03, Math.sin(k) * 0.3, 0.5, 2600, 0.35); });
  pad(TB.end - 0.1, T.duration - 0.25, ['D3', 'A3', 'Fs4'], 0.035, { type: 'triangle', cut: 800, att: 0.5, rel: 1.6, send: 0.5 });
  motif(cu.close + 0.1, 0.09, [['A4', 0], ['D5', 0.32], ['Fs5', 0.64], ['D5', 1.3]]);

  // ================= SFX =================
  to = 's';
  const scratch = (t0, t1, v = 0.022) => each(t0, t1, E16, (t, k) => noiseHit(t + 0.01, 0.08, 'bandpass', 2600 + (k % 3) * 300, 1.4, v * (0.7 + (k % 2) * 0.4), 0.2));
  scratch(cu.mon - 0.2, cu.mon + 0.4); scratch(cu.thu - 0.2, cu.thu + 0.4); scratch(cu.q - 0.2, cu.q + 0.3);
  scratch(cu.cup - 0.3, cu.cup + 0.4); scratch(cu.sw - 0.2, cu.sw + 0.2);
  sweep(cu.sw + 0.4, cu.sw + 0.85, 0.016, 1800, 4200, 0.4);
  // plops as the cup fills, each a step higher
  ['f1', 'f2', 'f3', 'f4', 'night', 'stress', 'period'].forEach((c, i) => { blip(cu[c], 240 + i * 40, 120 + i * 20, 0.12, 0.08, 0); noiseHit(cu[c], 0.05, 'lowpass', 700, 1, 0.05, 0); });
  // the lunch falls into the hush, then the spill
  sweep(cu.hit - 0.32, cu.hit - 0.01, 0.015, 3000, 900, 0);
  each(cu.hit + 0.05, cu.hit + 0.7, 0.09, (t, k) => blip(t, 500 - k * 30, 300 - k * 20, 0.08, 0.04 * (1 - k / 8), k % 2 ? 0.4 : -0.4));
  [cu.meals, cu.symptoms, cu.bathroom, cu.mood].forEach((t, i) => scratch(t - 0.2, t + 0.15, 0.016));
  chime(cu.yours - 0.25, [nz('D6'), nz('A6')], 0.04, 0.2);
  T.morphs.forEach((tc) => sweep(tc - 0.42, tc + 0.02, 0.012, 450, 2600, 0));
