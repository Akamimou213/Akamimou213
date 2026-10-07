"""Seamless 20s loop at 120 BPM (10 bars), synthesized in numpy. Rendered twice and the second pass kept,
so reverb and decays from the end wrap into the start, matching the video's last frame == first frame.
Usage: python3 -I music.py out/music_raw.wav"""
import sys
import numpy as np
import soundfile as sf
from scipy.signal import butter, fftconvolve, sosfilt
SR, LOOP, B = 48000, 20.0, .5
N = int(SR * LOOP * 2)
rng = np.random.default_rng(20)
mix = np.zeros((N + SR * 2, 2))
tt = lambda d: np.arange(int(d * SR)) / SR
flt = lambda x, k, f: sosfilt(butter(2, f, k, fs=SR, output='sos'), x, axis=0)
def put(sig, t, gain=1., pan=0.):
    i = int(round(t * SR)); a = (pan + 1) * np.pi / 4
    s = np.stack([sig * np.cos(a), sig * np.sin(a)], 1) * np.sqrt(2) * gain
    s = s[:len(mix) - i]; mix[i:i + len(s)] += s
NOTE = {'C': 0, 'C#': 1, 'D': 2, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'A': 9, 'B': 11}
hz = lambda n: 440 * 2 ** ((12 * (int(n[-1]) + 1) + NOTE[n[:-1]] - 69) / 12)
def kick():
    x = tt(.32); return np.tanh(1.5 * np.sin(2 * np.pi * np.cumsum(52 + 90 * np.exp(-x * 34)) / SR) * np.exp(-x * 9))
def rim():
    x = tt(.08); return flt(rng.standard_normal(len(x)), 'bandpass', [1800, 5000]) * np.exp(-x * 70) * .6 + np.sin(2 * np.pi * 1700 * x) * np.exp(-x * 90) * .3
def hat():
    x = tt(.035); return flt(rng.standard_normal(len(x)), 'highpass', 8500) * np.exp(-x * 110)
def pluck(f, d=.45, br=1.):
    x = tt(d); I = 2.2 * br * np.exp(-x * 10) + .15
    return np.sin(2 * np.pi * f * x + I * np.sin(4 * np.pi * f * x)) * np.exp(-x * 7) * np.minimum(1, x / .002)
def keys(fs, d=1.9):
    x = tt(d); s = sum(np.sin(2 * np.pi * f * x) + .3 * np.sin(4 * np.pi * f * x) * np.exp(-x * 3) for f in fs) / len(fs)
    return s * np.minimum(1, x / .01) * np.exp(-x * 1.4)
def bass(f, d=.45):
    x = tt(d); return flt(np.sin(2 * np.pi * f * x) + .25 * np.sign(np.sin(2 * np.pi * f * x)), 'lowpass', 300) * np.minimum(1, x / .005) * np.exp(-x * 3)
PROG = [('D', ['D4', 'F#4', 'A4', 'C#5'], 'D2'), ('B', ['B3', 'D4', 'F#4', 'A4'], 'B1'), ('G', ['G3', 'B3', 'D4', 'F#4'], 'G1'), ('A', ['A3', 'C#4', 'E4', 'G4'], 'A1'), ('D', ['D4', 'F#4', 'A4', 'C#5'], 'D2')]
for loop in range(2):
    for bar in range(10):
        t0 = loop * LOOP + bar * 2.0
        name, ch, root = PROG[bar % 4] if bar < 9 else PROG[4]
        put(keys([hz(n) for n in ch]), t0, .22, 0)
        for b in range(4):
            tb = t0 + b * B
            put(kick(), tb, .55 if b % 2 == 0 else .4, 0)
            if b % 2 == 1: put(rim(), tb, .35, .1)
            for e in range(2): put(hat(), tb + e * B / 2, .07 if e == 0 else .1, .3)
            put(bass(hz(root)), tb + B / 2, .38, 0)
            for s16 in range(2):
                n = ch[(b * 2 + s16 + bar) % 4]; put(pluck(hz(n) * 2), tb + s16 * B / 2, .07, -.4 if s16 else .4)
irL = int(1.4 * SR); x = np.arange(irL) / SR
ir = np.stack([flt(np.random.default_rng(c).standard_normal(irL), 'lowpass', 6500) * np.exp(-x * 4) for c in range(2)], 1)
ir /= np.sqrt((ir ** 2).sum(0, keepdims=True)) / .25
wet = np.stack([fftconvolve(mix[:, c], ir[:, c])[:len(mix)] for c in range(2)], 1)
out = (mix + wet * .3)[int(LOOP * SR):int(2 * LOOP * SR)]
out = flt(out, 'highpass', 30); out /= np.abs(out).max() / .6
sf.write(sys.argv[1], out.astype(np.float32), SR, subtype='FLOAT'); print('loop', out.shape)
