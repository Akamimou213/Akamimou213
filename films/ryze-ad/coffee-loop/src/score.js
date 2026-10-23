  // =====================================================================
  //  SCORE BODY v2 — The Caffeine Receipt. Warm D major. Printer chatter on every line; a hush, THE LOUDEST HIT on the
  //  stamp; a riser into each zoom-through, landing on the cut; ticks and a dusky pad under the clock; an accelerating
  //  printer and paper slaps on the pile; the rip, the slide-in, odometer ticks, the pouch's thud; a button click.
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
  // the clock: the day turns to night, the pad darkens
  pad(TB.clock - 0.05, TB.again + 0.1, ['B2', 'Fs3', 'D4'], 0.028, { type: 'triangle', cut: 900, att: 0.3, rel: 0.3, send: 0.4 });
  drone(cu.six, TB.again, nz('B1'), 0.035, { att: 1.2, rel: 0.3 });
  // the pile: the groove comes back and speeds up with the printer
  each(TB.again, TB.fix - 0.1, E8, (t, k) => { pluck(t, nz(ARP[k % 16]), 0.04 * (k % 4 === 0 ? 1.2 : 0.85), Math.sin(k * 0.8) * 0.3, 0.28, 3000, 0.18); if (k % 4 === 0) bass(t, nz(['D2', 'B1', 'G1', 'A1'][Math.floor(k / 8) % 4]), 0.11); });
  // the fix and the end: warm and flat, the motif resolved
  pad(TB.fix - 0.05, T.duration - 0.25, ['D3', 'A3', 'D4', 'Fs4'], 0.04, { cut: 1200, att: 0.4, rel: 1.6, send: 0.5 });
  each(cu.ryze, TB.end, BEAT, (t, k) => { if (k % 2 === 0) pluck(t, nz(['D5', 'A4', 'B4', 'A4'][(k / 2) % 4]), 0.03, Math.sin(k) * 0.3, 0.5, 2600, 0.35); });
  motif(cu.close + 0.2, 0.09, [['A4', 0], ['D5', 0.32], ['Fs5', 0.64], ['D5', 1.3]]);

  // ================= SFX =================
  to = 's';
  chatter(cu.print - 0.1, 0.4);
  [cu.r1, cu.r2, cu.r3, cu.total, cu.fda].forEach((t) => chatter(t - 0.05, 0.4));
  [cu.r1, cu.r2, cu.r3].forEach((t, i) => blip(t + 0.1, 520 + i * 90, 760 + i * 90, 0.06, 0.03, 0.5));   // the cups pop in
  blip(cu.fda + 0.5, nz('A5'), nz('D6'), 0.1, 0.04, 0.3);
  sweep(cu.amount, cu.amount + 0.3, 0.01, 2400, 3400, 0.2);
  sweep(cu.stamp - 0.35, cu.stamp + 0.05, 0.012, 600, 2200, -0.2);                                        // the whip to 16:00
  sweep(cu.stamp - 0.1, cu.stamp + 0.35, 0.014, 2600, 3600, -0.2);
  noiseHit(cu.hit - 0.02, 0.1, 'lowpass', 800, 0.8, 0.3, 0); sub(cu.hit - 0.02, 0.14);
  // each zoom-through: a riser that ends exactly on the cut; the inverse zoom: a falling sweep
  riser(TB.clock - 0.45, TB.clock, 0.012); sub(TB.clock, 0.05);
  sweep(TB.again - 0.45, TB.again + 0.05, 0.016, 3000, 400, 0);
  riser(TB.fix - 0.45, TB.fix, 0.012); sub(TB.fix, 0.05);
  sweep(TB.end - 0.45, TB.end + 0.05, 0.014, 500, 2800, 0);
  each(TB.clock + 0.2, VL('six').t1 + 0.4, 0.5, (t, k) => noiseHit(t, 0.02, 'highpass', 4200 + (k % 2) * 600, 1.2, 0.03, k % 2 ? 0.3 : -0.3));
  each(cu.six - 0.1, cu.six + 1.3, 0.06, (t, k) => noiseHit(t, 0.012, 'highpass', 5200, 1.2, 0.016, 0.2));   // the hands race
  noiseHit(cu.cut, 0.08, 'bandpass', 1800, 1.2, 0.12, 0.3); sweep(cu.cut, cu.cut + 0.3, 0.02, 3000, 900, 0.3);   // the snap
  // the pile: printer chatter and a paper slap per receipt, accelerating
  { const t0 = TB.again + 0.1, span = cu.prints + 0.6 - t0, sc = span / (DROPS[DROPS.length - 1] + 0.3);
    DROPS.forEach((d, k) => { const td = t0 + d * sc; chatter(td - 0.1, 0.16, 0.025); noiseHit(td + 0.32, 0.05, 'lowpass', 1400, 0.9, 0.09, Math.sin(k) * 0.4); }); }
  // the fix
  sweep(cu.lighten, cu.lighten + 0.32, 0.04, 1500, 6000, -0.3); noiseHit(cu.lighten, 0.2, 'highpass', 2500, 0.7, 0.05, -0.3);   // the rip
  sweep(cu.fortyeight - 0.45, cu.fortyeight - 0.05, 0.016, 900, 2600, -0.4);                                                     // the slide-in
  chatter(cu.fortyeight - 0.05, 0.4, 0.03);
  each(cu.fortyeight + 0.2, cu.fortyeight + 1.0, 0.07, (t, k) => noiseHit(t, 0.012, 'highpass', 4800, 1.5, 0.022 * (1 - k / 14), 0));   // odometer
  chime(cu.fortyeight + 1.0, [nz('D6'), nz('A6')], 0.035, 0.2);
  noiseHit(cu.ryze, 0.12, 'lowpass', 500, 0.9, 0.22, 0.3); sub(cu.ryze, 0.08);                                                  // the pouch lands
  blip(VL('close').t1 + 0.3, 700, 1050, 0.08, 0.05, 0);
  noiseHit(VL('close').t1 + 1.1, 0.03, 'bandpass', 2400, 2, 0.08, 0);                                                           // the button press
