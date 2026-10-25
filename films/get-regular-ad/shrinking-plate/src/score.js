  // =====================================================================
  //  SCORE BODY — The Shrinking Plate. Tender, 84 BPM. D minor while the plate shrinks and the menu worries her;
  //  a curious pulse under the plates chart; the shelf refills over a lift; D major from "a surer one" to the end card.
  // =====================================================================
  const T = TIMELINE, cu = T.cues;
  const each = (t0, t1, step, fn) => { for (let k = 0; t0 + k * step < t1 - 1e-6; k++) fn(t0 + k * step, k); };
  const motif = (t, vel, notes) => notes.forEach(([n, dt], i) => pluck(t + dt, nz(n), vel, -0.15 + i * 0.12, 0.9, 2200, 0.45));
  const MIN = [['D3', 'A3', 'F4'], ['Bb2', 'F3', 'D4'], ['F3', 'C4', 'A4'], ['C3', 'G3', 'E4']];
  const MAJ = [['D3', 'A3', 'Fs4'], ['A2', 'E3', 'Cs4'], ['B2', 'Fs3', 'D4'], ['G2', 'D3', 'B3']];
  const BAR = BEAT * 4;
  const chords = (t0, t1, set, vel, o = {}) => each(t0, t1, BAR, (t, k) => pad(t, Math.min(t + BAR + 0.3, t1), set[k % 4], vel, { type: 'triangle', cut: o.cut || 900, att: 0.6, rel: 0.6, send: 0.5 }));

  // ================= MUSIC =================
  to = 'm';
  chords(0, TB.grid, MIN, 0.026);
  each(0.4, TB.grid - 0.3, BEAT, (t, k) => { if (k % 2 === 0) pluck(t, nz(['A4', 'F4', 'C5', 'G4'][Math.floor(k / 4) % 4]), 0.03, Math.sin(k) * 0.3, 0.6, 2000, 0.45); });
  // the plates: a curious pulse
  chords(TB.grid, TB.shelf, MIN, 0.024, { cut: 1100 });
  each(TB.grid, TB.shelf - 0.2, E8, (t, k) => { pluck(t, nz(['D4', 'A4', 'F4', 'A4'][k % 4]), 0.022 * (k % 4 === 0 ? 1.3 : 0.9), Math.sin(k * 0.7) * 0.35, 0.25, 2600, 0.2); if (k % 8 === 0) bass(t, nz(['D2', 'Bb1', 'F2', 'C2'][Math.floor(k / 8) % 4]), 0.08); });
  // the shelf: lifting toward the major
  chords(TB.shelf, TB.kitchen, [['F3', 'C4', 'A4'], ['Bb2', 'F3', 'D4'], ['G2', 'D3', 'Bb3'], ['A2', 'E3', 'Cs4']], 0.028, { cut: 1300 });
  each(TB.shelf, TB.kitchen - 0.2, E8, (t, k) => { pluck(t, nz(['F4', 'A4', 'C5', 'A4', 'D4', 'F4', 'Bb4', 'F4'][k % 8]), 0.026, Math.sin(k) * 0.3, 0.3, 3000, 0.25); if (k % 8 === 0) bass(t, nz(['F2', 'Bb1', 'G1', 'A1'][Math.floor(k / 8) % 4]), 0.09); });
  // "a surer one" → the end: warm D major
  chords(TB.kitchen, T.duration - 0.2, MAJ, 0.034, { cut: 1500 });
  each(TB.kitchen + 0.1, END0() - 0.2, BEAT, (t, k) => { pluck(t, nz(['Fs4', 'A4', 'D5', 'A4'][k % 4]), 0.03, Math.sin(k) * 0.3, 0.5, 2600, 0.35); if (k % 4 === 0) bass(t, nz(['D2', 'A1', 'B1', 'G1'][Math.floor(k / 4) % 4]), 0.1); });
  motif(cu.surer + 0.05, 0.07, [['A4', 0], ['D5', 0.3], ['Fs5', 0.6]]);
  motif(END0() + 0.2, 0.09, [['A4', 0], ['D5', 0.32], ['Fs5', 0.64], ['A5', 0.96], ['D5', 1.7]]);
  drone(END0(), T.duration, nz('D2'), 0.03, { att: 0.8, rel: 0.8 });

  // ================= SFX =================
  to = 's';
  // the plate: each food lifts (a soft rising whoosh) and is gone
  [cu.bread, cu.cheese, cu.onion, cu.garlic].forEach((t, i) => { noiseHit(t + 0.05, 0.05, 'bandpass', 2400, 1.4, 0.05, -0.3 + i * 0.2); sweep(t + 0.12, t + 0.62, 0.022, 500, 3200, [-0.6, 0.6, -0.8, 0.3][i]); });
  sub(TB.table, 0.06); pad(cu.worry - 0.25, cu.worry + 1.4, ['D3', 'F3', 'A3'], 0.03, { type: 'sine', cut: 700, att: 0.5, rel: 0.6, send: 0.6 });   // she appears
  // dinner out: a low room murmur; the pen line, the question
  noiseHit(TB.menu, TB.pov - TB.menu, 'bandpass', 600, 0.6, 0.02, 0, 0.3);
  each(cu.what + 0.1, cu.what + 0.7, 0.05, (t, k) => noiseHit(t, 0.03, 'highpass', 5200 + (k % 3) * 300, 1.5, 0.018, 0.3));
  blip(cu.safe + 0.15, nz('A5'), nz('E6'), 0.12, 0.03, 0.3);
  // 100 plates: ticks as they land, a soft tok per marked plate
  each(TB.grid + 0.05, TB.grid + 0.6, 0.03, (t, k) => noiseHit(t, 0.015, 'bandpass', 3000 + (k % 4) * 250, 3, 0.02, Math.sin(k) * 0.5));
  for (let k = 0; k < 20; k++) blip(cu.twenty + 0.08 + k * 0.035, 520 + (k % 5) * 40, 380, 0.05, 0.022, Math.sin(k) * 0.5);
  // the spotlight comes on
  noiseHit(TB.onion + 0.1, 0.09, 'lowpass', 900, 0.9, 0.16, 0); sub(TB.onion + 0.1, 0.05);
  drone(TB.onion + 0.12, TB.grid2, nz('A2'), 0.018, { att: 0.2, rel: 0.2 });
  // 2 or 3: the rest fade, three glow
  sweep(cu.two - 0.05, cu.two + 0.35, 0.012, 2800, 700, 0);
  [0, 1, 2].forEach((i) => chime(cu.two + 0.12 + i * 0.14, [nz(['D6', 'Fs6', 'A6'][i])], 0.03, -0.3 + i * 0.3));
  // the shelf refills: jars land, one row at a time
  [cu.back - 0.5, cu.group - 0.3, cu.time - 0.06].forEach((t, i) => { noiseHit(t + 0.1, 0.06, 'lowpass', 700, 0.8, 0.09, 0); each(t + 0.1, t + 0.32, 0.055, (tt, k) => noiseHit(tt, 0.04, 'bandpass', 3800 + k * 300 + i * 200, 6, 0.03, -0.4 + k * 0.25)); });
  // the phone: the push, taps for each row, the pattern line, the chip
  sweep(TB.phone + 0.05, cu.log + 0.25, 0.012, 400, 1800, 0);
  [cu.meals, cu.symptoms, cu.side].forEach((t, i) => blip(t, 900 + i * 120, 1300 + i * 120, 0.06, 0.03, 0.2));
  sweep(cu.patterns - 0.15, cu.patterns + 0.6, 0.016, 1200, 4200, 0.2);
  chime(cu.bring + 0.1, [nz('A5'), nz('D6')], 0.035, 0.2);
  // the end card: the button press
  noiseHit(cu.start + 0.75 + 1.3, 0.03, 'bandpass', 2400, 2, 0.07, 0);
