  // =====================================================================
  //  SCORE BODY — Level Up. The series' D-major motif, with game colour: blips, coins, a level-up arpeggio.
  //  Arc: playful intro -> the doctor (it thins, drops out on "blank") -> hush -> LEVEL UP (the loudest) -> a light
  //  groove under the tools, a coin per +1 -> three checks -> the motif, resolved, under the end card.
  // =====================================================================
  const T = TIMELINE, cu = T.cues;
  const each = (t0, t1, step, fn) => { for (let k = 0; t0 + k * step < t1 - 1e-6; k++) fn(t0 + k * step, k); };
  const motif = (t, vel, notes = [['A4', 0], ['D5', 0.32]]) => notes.forEach(([n, dt], i) => pluck(t + dt, nz(n), vel, -0.1 + i * 0.2, 0.7, 2400, 0.4));
  const ARP = ['D4', 'A4', 'Fs4', 'A4', 'B3', 'Fs4', 'D4', 'Fs4', 'G3', 'D4', 'B3', 'D4', 'A3', 'E4', 'Cs4', 'E4'];
  const coin = (t, v = 0.05) => { blip(t, nz('B5'), nz('B5'), 0.06, v, 0.2); blip(t + 0.07, nz('E6'), nz('E6'), 0.16, v, 0.2); };

  // ================= MUSIC =================
  to = 'm';
  pad(0.0, TB.doc + 0.3, ['D3', 'A3', 'Fs4'], 0.03, { type: 'triangle', cut: 800, att: 0.4, rel: 0.3, send: 0.5 });
  motif(0.3, 0.09);
  each(0.0, TB.doc, E8, (t, k) => { if (k % 2 === 0) pluck(t, nz(ARP[k % 16]), 0.04, Math.sin(k) * 0.3, 0.3, 2800, 0.2); if (k % 4 === 0) bass(t, nz(['D2', 'B1', 'G1', 'A1'][Math.floor(k / 8) % 4]), 0.1); });
  pad(TB.doc - 0.1, cu.blank, ['B2', 'Fs3', 'D4'], 0.026, { type: 'triangle', cut: 700, att: 0.3, rel: 0.2, send: 0.2 });
  each(TB.doc, cu.blank - 0.2, BEAT, (t, k) => pluck(t, nz(['Fs4', 'D4', 'B3', 'A3'][k % 4]), 0.03, 0.2 - (k % 4) * 0.1, 0.4, 1800, 0.1));
  drone(cu.blank + 0.2, VL('stress').t1 + 0.1, nz('B1'), 0.03, { att: 0.4, rel: 0.2 });
  // LEVEL UP: the stab, a rising arpeggio, then a light groove under the tools
  ['D3', 'A3', 'D4', 'Fs4', 'A4', 'D5'].forEach((n, i) => pluck(cu.hit + i * 0.006, nz(n), 0.34, (i - 2.5) * 0.15, 0.8, 5200, 0.4));
  pad(cu.hit, cu.hit + 0.45, ['D3', 'A3', 'D4', 'Fs4', 'A4', 'D5'], 0.42, { cut: 3600, att: 0.008, rel: 0.38, send: 0.3 });
  ['D5', 'Fs5', 'A5', 'D6'].forEach((n, i) => blip(cu.hit + 0.12 + i * 0.07, nz(n), nz(n), 0.09, 0.06, -0.3 + i * 0.2));
  pad(TB.tools - 0.2, TB.from, ['D3', 'A3', 'E4'], 0.03, { cut: 1000, att: 0.4, rel: 0.3, send: 0.35 });
  each(TB.tools, TB.from - 0.25, E8, (t, k) => { const acc = k % 4 === 0 ? 1.2 : k % 2 ? 0.7 : 0.9; pluck(t, nz(ARP[k % 16]), 0.045 * acc, Math.sin(k * 0.8) * 0.3, 0.3, 3000, 0.2); if (k % 4 === 0) bass(t, nz(['D2', 'B1', 'G1', 'A1'][Math.floor(k / 8) % 4]), 0.12); });
  // from -> to, then the end: the motif resolved
  pad(TB.from - 0.1, T.duration - 0.25, ['D3', 'A3', 'Fs4'], 0.035, { type: 'triangle', cut: 800, att: 0.5, rel: 1.6, send: 0.5 });
  motif(cu.knowing + 0.1, 0.09, [['A4', 0], ['D5', 0.32], ['Fs5', 0.64], ['D5', 1.3]]);
  pad(TB.end, T.duration - 0.25, ['D3', 'A3', 'D4', 'Fs4'], 0.04, { cut: 1100, att: 0.6, rel: 1.6, send: 0.5 });

  // ================= SFX =================
  to = 's';
  blip(cu.lv - 0.05, nz('A5'), nz('D6'), 0.1, 0.05, 0);
  [cu.bloat, cu.bath, cu.energy].forEach((t, i) => blip(t, 600 + i * 120, 900 + i * 120, 0.07, 0.045, -0.4 + i * 0.4));
  [cu.since, cu.often, cu.after].forEach((t, i) => noiseHit(t - 0.1, 0.05, 'bandpass', 1600 + i * 300, 2, 0.06, 0.4));
  sweep(cu.blank - 0.1, cu.blank + 0.5, 0.012, 3000, 600, -0.3);
  noiseHit(cu.stress + 0.18, 0.12, 'lowpass', 700, 0.8, 0.22, 0); sub(cu.stress + 0.18, 0.06);
  T.cuts.forEach((t) => noiseHit(t - 0.02, 0.04, 'highpass', 3000, 0.8, 0.03, 0));
  [VL('one').t1, VL('two').t1, VL('three').t1, VL('four').t1].forEach((t) => coin(t + 0.2));
  sweep(cu.happens, cu.happens + 0.6, 0.012, 2600, 3400, 0.2);
  [cu.meals, cu.sleep, cu.stress2, cu.cycle].forEach((t, i) => blip(t - 0.12, 700 + i * 140, 1000 + i * 140, 0.06, 0.04, -0.4 + i * 0.25));
  chime(cu.pattern, [nz('D6'), nz('A6')], 0.04, 0.2);
  sweep(cu.story + 0.15, cu.story + 0.45, 0.02, 1800, 4800, -0.3);
  [0, 1, 2].forEach((k) => { blip(cu.answers + k * 0.22, nz(['A5', 'D6', 'Fs6'][k]), nz(['A5', 'D6', 'Fs6'][k]), 0.12, 0.05, 0.3); });
  sweep(cu.guessing + 0.55, cu.guessing + 0.9, 0.02, 1500, 4200, 0);
  T.morphs.forEach((tc) => sweep(tc - 0.42, tc + 0.02, 0.012, 450, 2600, 0));
