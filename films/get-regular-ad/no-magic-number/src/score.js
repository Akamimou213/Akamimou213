  // =====================================================================
  //  SCORE BODY — No Magic Number. D major, warm and sparse; same motif as film #1 (the series' sound).
  //  Arc: a morning room -> plucks as the crowd arrives -> the note tears -> two gentle drops -> hush under "never seen"
  //  -> THE LOUDEST HIT when the gold band draws -> a flat warm chord under Get Regular -> the motif, resolved.
  // =====================================================================
  const T = TIMELINE, cu = T.cues;
  const each = (t0, t1, step, fn) => { for (let k = 0; t0 + k * step < t1 - 1e-6; k++) fn(t0 + k * step, k); };
  const MOTIF = [['A4', 0], ['D5', 0.32]];
  const motif = (t, vel, notes = MOTIF) => notes.forEach(([n, dt], i) => pluck(t + dt, nz(n), vel, -0.1 + i * 0.2, 0.7, 2400, 0.4));
  const SILENT0 = VL('seen').t0 + 0.2;
  const ARP = ['D4', 'A4', 'Fs4', 'A4', 'B3', 'Fs4', 'D4', 'Fs4', 'G3', 'D4', 'B3', 'D4', 'A3', 'E4', 'Cs4', 'E4'];

  // ================= MUSIC =================
  to = 'm';
  pad(0.0, TB.range + 0.4, ['D3', 'A3', 'Fs4'], 0.03, { type: 'triangle', cut: 800, att: 0.6, rel: 0.4, send: 0.5 });
  motif(0.3, 0.09);
  pad(TB.range - 0.2, SILENT0, ['D3', 'A3', 'E4'], 0.03, { cut: 950, att: 0.5, rel: 0.3, send: 0.35 });
  each(TB.range, SILENT0 - 0.5, E8, (t, k) => {
    const acc = k % 4 === 0 ? 1.2 : k % 2 ? 0.7 : 0.9;
    if (k % 2 === 0 || t > TB.two) pluck(t, nz(ARP[k % 16]), 0.045 * acc, Math.sin(k * 0.8) * 0.3, 0.32, 2800, 0.2);
    if (k % 4 === 0) bass(t, nz(['D2', 'B1', 'G1', 'A1'][Math.floor(k / 8) % 4]), 0.11);
  });
  ['D3', 'A3', 'D4', 'Fs4', 'A4', 'D5'].forEach((n, i) => pluck(cu.hit + i * 0.006, nz(n), 0.34, (i - 2.5) * 0.15, 0.8, 5200, 0.4));
  pad(cu.hit, cu.hit + 0.45, ['D3', 'A3', 'D4', 'Fs4', 'A4', 'D5'], 0.42, { cut: 3600, att: 0.008, rel: 0.38, send: 0.3 });
  pad(cu.hit + 0.35, TB.end + 0.5, ['D3', 'A3', 'D4', 'Fs4', 'A4'], 0.05, { cut: 1300, att: 0.4, rel: 0.5, send: 0.5 });
  drone(cu.hit + 0.35, TB.end + 0.5, nz('D2'), 0.05, { att: 0.3, rel: 0.5 });
  each(cu.logo, TB.end, BEAT, (t, k) => { if (k % 2 === 0) pluck(t, nz(['D5', 'A4', 'B4', 'A4'][(k / 2) % 4]), 0.03, Math.sin(k) * 0.3, 0.5, 2600, 0.35); });
  pad(TB.end - 0.1, T.duration - 0.25, ['D3', 'A3', 'Fs4'], 0.035, { type: 'triangle', cut: 800, att: 0.5, rel: 1.6, send: 0.5 });
  motif(cu.close + 0.2, 0.09, [['A4', 0], ['D5', 0.32], ['Fs5', 0.64], ['D5', 1.3]]);

  // ================= SFX =================
  to = 's';
  blip(cu.often, 500, 760, 0.12, 0.05, 0.2);
  noiseHit(cu.once - 0.03, 0.05, 'bandpass', 1800, 2, 0.08, 0.3); blip(cu.once, 900, 1200, 0.06, 0.04, 0.3);
  T.morphs.forEach((tc) => sweep(tc - 0.42, tc + 0.02, 0.012, 450, 2600, 0));
  each(cu.crowd + 0.1, cu.crowd + 0.1 + 40 * 0.03, 0.06, (t, k) => blip(t, 700 + (k % 7) * 70, 900 + (k % 7) * 70, 0.03, 0.018, -0.6 + (k % 10) * 0.12));
  [cu.aweek - 0.15, cu.aday - 0.15].forEach((t, i) => blip(t, 800 + i * 300, 1100 + i * 300, 0.06, 0.04, i ? 0.4 : -0.4));
  sweep(cu.magic + 0.08, cu.magic + 0.5, 0.04, 1600, 5200, 0);
  [0, 1].forEach((i) => { noiseHit(cu.three + i * 0.12 + 0.08, 0.05, 'lowpass', 900, 0.8, 0.12, i ? 0.2 : -0.2); });
  blip(cu.normal, 880, 1320, 0.1, 0.04, -0.2);
  sweep(cu.change - 0.1, cu.change + 0.35, 0.016, 2600, 3800, 0.2);
  each(cu.dots + 0.15, cu.dots + 0.15 + 12 * 0.22, 0.22, (t, k) => blip(t, 760 + k * 20, 980 + k * 20, 0.04, 0.025, -0.5 + k / 12));
  chime(cu.hit + 0.02, [nz('D6'), nz('A6'), nz('Fs6')], 0.05);
  sweep(cu.hit + 0.48, cu.hit + 0.95, 0.014, 2600, 3800, 0.3);
  blip(cu.logo, 700, 1050, 0.08, 0.05, 0);
  chime(cu.stands, [nz('A5'), nz('D6')], 0.03, 0.2);
