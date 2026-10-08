// Synthesize the film's three UI sounds as local WAVs (48 kHz, 16-bit mono). Deterministic: seeded noise,
// no external samples, no paid service. Each file has its own fade-in/out and a fixed peak, so the mix keeps headroom.
//   npm run sfx      → public/sfx/click.wav, move.wav, complete.wav
import { mkdirSync, writeFileSync } from 'node:fs';

const SR = 48000;
const dB = (d) => 10 ** (d / 20);
let seed = 7;
const noise = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2147483648) - 1;

// Linear fade in over `a` seconds and out over `r` seconds at the end of a buffer of length `len` seconds.
const fades = (buf, a, r) => {
  const n = buf.length, na = Math.max(1, Math.round(a * SR)), nr = Math.max(1, Math.round(r * SR));
  for (let i = 0; i < na && i < n; i++) buf[i] *= i / na;
  for (let i = 0; i < nr && i < n; i++) buf[n - 1 - i] *= i / nr;
  return buf;
};
const normalize = (buf, peakDb) => {
  let m = 0; for (const v of buf) m = Math.max(m, Math.abs(v));
  const g = dB(peakDb) / (m || 1);
  return buf.map((v) => v * g);
};

// 1. Click: a short, dry UI tick (two damped partials + a 2 ms noise transient). 60 ms, peak −8 dBFS.
function click() {
  const len = 0.06, buf = new Float64Array(Math.round(len * SR));
  for (let i = 0; i < buf.length; i++) {
    const t = i / SR;
    buf[i] = Math.sin(2 * Math.PI * 2400 * t) * Math.exp(-t * 170)
      + 0.55 * Math.sin(2 * Math.PI * 1150 * t) * Math.exp(-t * 110)
      + (t < 0.002 ? 0.35 * noise() * (1 - t / 0.002) : 0);
  }
  return normalize(fades(buf, 0.0008, 0.015), -8);
}

// 2. Movement: a soft airy swell (120 ms attack, so it is audible on the frame the cards start moving) (noise through a one-pole low-pass whose cutoff rises and falls)
//    with a quiet rising sine underneath. 0.6 s, peak −12 dBFS.
function move() {
  const len = 0.6, buf = new Float64Array(Math.round(len * SR));
  let lp = 0, lp2 = 0;
  for (let i = 0; i < buf.length; i++) {
    const t = i / SR, x = t / len;
    const env = Math.sin(Math.PI * Math.min(1, x / 0.2) / 2) * (1 - Math.max(0, (x - 0.3) / 0.7)) ** 2;
    const cutoff = 600 + 2600 * Math.sin(Math.PI * Math.min(1, x / 0.8));
    const k = 1 - Math.exp(-2 * Math.PI * cutoff / SR);
    lp += k * (noise() - lp); lp2 += k * (lp - lp2);
    const body = 0.18 * Math.sin(2 * Math.PI * (210 * t + 90 * t * t));
    buf[i] = (lp2 * 2.2 + body) * env;
  }
  return normalize(fades(buf, 0.01, 0.12), -12);
}

// 3. Completion: a restrained two-note chime, a perfect fifth (A5 then E6, 70 ms apart), soft attack,
//    exponential decay. 1.4 s, peak −9 dBFS.
function complete() {
  const len = 1.4, buf = new Float64Array(Math.round(len * SR));
  const note = (f, start, amp) => {
    for (let i = Math.round(start * SR); i < buf.length; i++) {
      const t = i / SR - start;
      const env = Math.min(1, t / 0.008) * Math.exp(-t / 0.32);
      buf[i] += amp * env * (Math.sin(2 * Math.PI * f * t) + 0.18 * Math.sin(2 * Math.PI * 2 * f * t) * Math.exp(-t / 0.12));
    }
  };
  note(880, 0, 0.8);
  note(1318.51, 0.07, 0.6);
  return normalize(fades(buf, 0.002, 0.25), -9);
}

const wav = (buf) => {
  const n = buf.length, b = Buffer.alloc(44 + n * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVEfmt ', 8);
  b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34);
  b.write('data', 36); b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, buf[i])) * 32767), 44 + i * 2);
  return b;
};

const out = new URL('../public/sfx/', import.meta.url);
mkdirSync(out, { recursive: true });
for (const [name, fn] of [['click', click], ['move', move], ['complete', complete]]) {
  const buf = fn();
  let m = 0; for (const v of buf) m = Math.max(m, Math.abs(v));
  writeFileSync(new URL(`${name}.wav`, out), wav(buf));
  console.log(`public/sfx/${name}.wav  ${(buf.length / SR).toFixed(3)} s  peak ${(20 * Math.log10(m)).toFixed(1)} dBFS`);
}
