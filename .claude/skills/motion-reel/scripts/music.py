"""Starter score synthesized in numpy, locked to timeline.json (bpm, duration, loop). Change the progression,
voices and arrangement per film; keep the grid. No generic synth pads: plucks, keys, drums, sub bass.
Usage: python3 -I music.py timeline.json out/music.wav [--key D] [--seed 20]
Loop films: the score is rendered twice and the second pass kept, so reverb tails wrap into bar 1."""
import argparse
import json

import numpy as np
import soundfile as sf
from scipy.signal import butter, fftconvolve, sosfilt

ap = argparse.ArgumentParser()
ap.add_argument('timeline'); ap.add_argument('out')
ap.add_argument('--key', default='D', help='tonic of the I-vi-IV-V maj7 progression')
ap.add_argument('--seed', type=int, default=20)
args = ap.parse_args()
TL = json.load(open(args.timeline))
SR, BPM, DUR, LOOP = 48000, TL.get('bpm', 120), TL['duration'], TL.get('loop', False)
B = 60 / BPM; BAR = 4 * B; BARS = int(round(DUR / BAR))
PASSES = 2 if LOOP else 1
mix = np.zeros((int(SR * DUR * PASSES) + SR * 3, 2))
rng = np.random.default_rng(args.seed)
tt = lambda d: np.arange(int(d * SR)) / SR
flt = lambda x, k, f: sosfilt(butter(2, f, k, fs=SR, output='sos'), x, axis=0)


def put(sig, t, gain=1., pan=0.):
    i = int(round(t * SR)); a = (pan + 1) * np.pi / 4
    s = np.stack([sig * np.cos(a), sig * np.sin(a)], 1) * np.sqrt(2) * gain
    s = s[:len(mix) - i]; mix[i:i + len(s)] += s


SEMI = {'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11}
hz = lambda midi: 440 * 2 ** ((midi - 69) / 12)
root = 60 + SEMI[args.key]                                   # tonic around C4
# I maj7, vi m7, IV maj7, V7 as semitone offsets from the tonic; bass two octaves down
PROG = [(0, [0, 4, 7, 11]), (9, [0, 3, 7, 10]), (5, [0, 4, 7, 11]), (7, [0, 4, 7, 10])]


def kick():
    x = tt(.32); return np.tanh(1.5 * np.sin(2 * np.pi * np.cumsum(52 + 90 * np.exp(-x * 34)) / SR) * np.exp(-x * 9))
def rim():
    x = tt(.08); return flt(rng.standard_normal(len(x)), 'bandpass', [1800, 5000]) * np.exp(-x * 70) * .6 + np.sin(2 * np.pi * 1700 * x) * np.exp(-x * 90) * .3
def hat():
    x = tt(.035); return flt(rng.standard_normal(len(x)), 'highpass', 8500) * np.exp(-x * 110)
def pluck(f, d=.45, br=1.):                                  # 2-op FM pluck
    x = tt(d); I = 2.2 * br * np.exp(-x * 10) + .15
    return np.sin(2 * np.pi * f * x + I * np.sin(4 * np.pi * f * x)) * np.exp(-x * 7) * np.minimum(1, x / .002)
def keys(fs, d=1.9):                                         # electric-piano-ish chord
    x = tt(d); s = sum(np.sin(2 * np.pi * f * x) + .3 * np.sin(4 * np.pi * f * x) * np.exp(-x * 3) for f in fs) / len(fs)
    return s * np.minimum(1, x / .01) * np.exp(-x * 1.4)
def bass(f, d=.45):
    x = tt(d); return flt(np.sin(2 * np.pi * f * x) + .25 * np.sign(np.sin(2 * np.pi * f * x)), 'lowpass', 300) * np.minimum(1, x / .005) * np.exp(-x * 3)


for p in range(PASSES):
    for bar in range(BARS):
        t0 = p * DUR + bar * BAR
        deg, ch = PROG[bar % 4] if bar < BARS - 1 or LOOP else PROG[0]   # one-shot films resolve home
        notes = [root + deg + c - (12 if deg > 4 else 0) for c in ch]
        put(keys([hz(n) for n in notes], BAR * .95), t0, .22, 0)
        for b in range(4):
            tb = t0 + b * B
            put(kick(), tb, .55 if b % 2 == 0 else .4, 0)
            if b % 2 == 1: put(rim(), tb, .35, .1)
            for e in range(2): put(hat(), tb + e * B / 2, .07 if e == 0 else .1, .3)
            put(bass(hz(root + deg - 24 - (12 if deg > 4 else 0)), B * .9), tb + B / 2, .38, 0)
            for s16 in range(2):
                n = notes[(b * 2 + s16 + bar) % 4] + 12; put(pluck(hz(n), B * .9), tb + s16 * B / 2, .07, -.4 if s16 else .4)
# generated stereo room IR (no external impulse responses needed)
irL = int(1.4 * SR); x = np.arange(irL) / SR
ir = np.stack([flt(np.random.default_rng(c).standard_normal(irL), 'lowpass', 6500) * np.exp(-x * 4) for c in range(2)], 1)
ir /= np.sqrt((ir ** 2).sum(0, keepdims=True)) / .25
wet = np.stack([fftconvolve(mix[:, c], ir[:, c])[:len(mix)] for c in range(2)], 1)
out = mix + wet * .3
out = out[int(DUR * SR):int(2 * DUR * SR)] if LOOP else out[:int(DUR * SR)]
out = flt(out, 'highpass', 30); out /= np.abs(out).max() / .6
sf.write(args.out, out.astype(np.float32), SR, subtype='FLOAT')
print(f'{BARS} bars at {BPM} BPM, {DUR}s, loop={LOOP} -> {args.out}')
