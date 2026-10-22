  // =====================================================================
  //  SCORE BODY — The Caffeine Receipt. Warm D major, light: printer chatter on each line, a hush, THE LOUDEST HIT on
  //  the stamp, clock ticks under the six hours, a faster printer for "again", a warm chord for RYZE, a resolved motif.
  // =====================================================================
  const T = TIMELINE, cu = T.cues;
  const each = (t0, t1, step, fn) => { for (let k = 0; t0 + k * step < t1 - 1e-6; k++) fn(t0 + k * step, k); };
  const motif = (t, vel, notes = [['A4', 0], ['D5', 0.32]]) => notes.forEach(([n, dt], i) => pluck(t + dt, nz(n), vel, -0.1 + i * 0.2, 0.7, 2400, 0.4));
  const ARP = ['D4', 'A4', 'Fs4', 'A4', 'B3', 'Fs4', 'D4', 'Fs4', 'G3', 'D4', 'B3', 'D4', 'A3', 'E4', 'Cs4', 'E4'];
  const chatter = (t0, dur, v = 0.035) => each(t0, t0 + dur, 0.045, (t, k) => noiseHit(t, 0.025, 'bandpass', 2200 + (k % 3) * 400, 2.5, v * (0.7 + (k % 2) * 0.4), 0.2));
  const SILENT0 = VL('turn').t1 - 0.05;

  // ================= MUSIC =================
  to = 'm';
  pad(0.0, SILENT0, ['D3', 'A3', 'Fs4'], 0.028, { type: 'triangle', cut: 800, att: 0.5, rel: 0.2, send: 0.45 });
  motif(0.3, 0.08);
  each(cu.r1, SILENT0 - 0.4, E8, (t, k) => { if (k % 2 === 0) pluck(t, nz(ARP[k % 16]), 0.038, Math.sin(k) * 0.3, 0.3, 2600, 0.2); if (k % 4 === 0) bass(t, nz(['D2', 'B1', 'G1', 'A1'][Math.floor(k / 8) % 4]), 0.1); });
  ['D3', 'A3', 'D4', 'Fs4', 'A4', 'D5'].forEach((n, i) => pluck(cu.hit + i * 0.006, nz(n), 0.32, (i - 2.5) * 0.15, 0.8, 5000, 0.4));
  pad(cu.hit, cu.hit + 0.45, ['D3', 'A3', 'D4', 'Fs4', 'A4'], 0.4, { cut: 3400, att: 0.008, rel: 0.38, send: 0.3 });
  pad(TB.clock - 0.2, TB.fix + 0.2, ['B2', 'Fs3', 'D4'], 0.026, { type: 'triangle', cut: 700, att: 0.4, rel: 0.3, send: 0.3 });
  pad(TB.fix - 0.2, T.duration - 0.25, ['D3', 'A3', 'D4', 'Fs4'], 0.04, { cut: 1200, att: 0.5, rel: 1.6, send: 0.5 });
  each(cu.ryze, TB.end, BEAT, (t, k) => { if (k % 2 === 0) pluck(t, nz(['D5', 'A4', 'B4', 'A4'][(k / 2) % 4]), 0.03, Math.sin(k) * 0.3, 0.5, 2600, 0.35); });
  motif(cu.close + 0.2, 0.09, [['A4', 0], ['D5', 0.32], ['Fs5', 0.64], ['D5', 1.3]]);

  // ================= SFX =================
  to = 's';
  chatter(cu.print - 0.1, 0.4);
  [cu.r1, cu.r2, cu.r3, cu.total, cu.fda].forEach((t) => chatter(t - 0.05, 0.4));
  blip(cu.fda + 0.5, nz('A5'), nz('D6'), 0.1, 0.04, 0.3);
  sweep(cu.stamp - 0.1, cu.stamp + 0.35, 0.014, 2600, 3600, -0.2);
  noiseHit(cu.hit - 0.02, 0.1, 'lowpass', 800, 0.8, 0.3, 0); sub(cu.hit - 0.02, 0.14);
  each(TB.clock + 0.2, VL('six').t1, 0.5, (t, k) => noiseHit(t, 0.02, 'highpass', 4200 + (k % 2) * 600, 1.2, 0.03, k % 2 ? 0.3 : -0.3));
  sweep(cu.six - 0.1, cu.six + 0.9, 0.01, 600, 1400, 0);
  sweep(cu.cut, cu.cut + 0.3, 0.02, 3000, 900, 0.3);
  [TB.again + 0.1, cu.less + 0.6, cu.prints - 0.1].forEach((t) => chatter(t, 0.3, 0.03));
  sweep(cu.lighten, cu.lighten + 0.35, 0.02, 1800, 4800, -0.2);
  chatter(cu.fortyeight - 0.3, 0.4, 0.03); chime(cu.fortyeight + 0.1, [nz('D6'), nz('A6')], 0.035, 0.2);
  blip(VL('close').t1 + 0.3, 700, 1050, 0.08, 0.05, 0);
  T.morphs.forEach((tc) => sweep(tc - 0.42, tc + 0.02, 0.012, 450, 2600, 0));
