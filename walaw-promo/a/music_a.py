"""Variant A score: 15s at 120 BPM, synthesized in numpy. Sound design is dense like the reference
(a tick per word, whooshes on every move) and every cut/accent sits on timeline.json events.
Usage: python3 -I music_a.py timeline.json out.wav"""
import json
import sys

import numpy as np
import soundfile as sf
from scipy.signal import butter, fftconvolve, sosfilt

TL = json.load(open(sys.argv[1]))
EV, ST = TL['events'], TL['strings']['en']
SR, DUR = 44100, float(TL['duration'])
N = int(SR * DUR)
B = 60 / TL['bpm']
rng = np.random.default_rng(15)
bus = {k: np.zeros((N + SR * 3, 2)) for k in ('drums', 'bass', 'music', 'fx')}


def tt(d):
    return np.arange(int(d * SR)) / SR


def flt(x, kind, f, order=2):
    return sosfilt(butter(order, f, kind, fs=SR, output='sos'), x, axis=0)


def put(sig, t, gain=1.0, pan=0.0, to='music'):
    i = int(round(t * SR))
    if i < 0 or i >= len(bus[to]):
        return
    if sig.ndim == 1:
        a = (pan + 1) * np.pi / 4
        sig = np.stack([sig * np.cos(a), sig * np.sin(a)], 1) * np.sqrt(2)
    seg = sig[:len(bus[to]) - i] * gain
    bus[to][i:i + len(seg)] += seg


def noise(d):
    return rng.standard_normal(int(d * SR))


NOTE = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}


def hz(n):
    return 440 * 2 ** ((12 * (int(n[-1]) + 1) + NOTE[n[:-1]] - 69) / 12)


def kick(level=1.0):
    x = tt(.38)
    s = np.sin(2 * np.pi * np.cumsum(50 + 105 * np.exp(-x * 32)) / SR) * np.exp(-x * 8) + noise(.38) * np.exp(-x * 420) * .22
    return np.tanh(1.6 * s) * level


def clap():
    x = tt(.28)
    env = sum((x >= o) * np.exp(-np.clip(x - o, 0, None) * 140) for o in (0, .009, .019)) + .5 * np.exp(-x * 16)
    return flt(noise(.28), 'bandpass', [1000, 5200]) * env * .55


def hat(open_=False):
    d = .14 if open_ else .04
    return flt(noise(d), 'highpass', 8000) * np.exp(-tt(d) * (24 if open_ else 95))


def pluck(f, d=.3, idx=2.6, ratio=2.0, bright=1.0, decay=9):
    x = tt(d)
    I = idx * bright * np.exp(-x * 12) + .2
    return np.sin(2 * np.pi * f * x + I * np.sin(2 * np.pi * f * ratio * x)) * np.exp(-x * decay) * np.minimum(1, x / .002)


def marimba(f, d=.35):
    x = tt(d)
    return (np.sin(2 * np.pi * f * x) + .25 * np.sin(2 * np.pi * f * 3.93 * x) * np.exp(-x * 30)) * np.exp(-x * 10) * np.minimum(1, x / .001)


def saw(f, d):
    return 2 * ((f * tt(d)) % 1) - 1


def stab(freqs, d=.2, cutoff=2800, decay=9):
    out = sum(saw(f * (1 + det), d) for f in freqs for det in (-.006, -.002, .002, .006)) / (len(freqs) * 4)
    x = tt(d)
    return flt(out, 'lowpass', cutoff) * np.exp(-x * decay) * np.minimum(1, x / .004)


def bass(f, d):
    x = tt(d)
    s = np.sign(np.sin(2 * np.pi * f * x)) * .4 + np.sin(2 * np.pi * f / 2 * x) * .85
    return flt(s, 'lowpass', 380) * np.minimum(1, x / .004) * np.exp(-x * 2.8)


def tick(f=2600, level=1.0):
    x = tt(.035)
    return (np.sin(2 * np.pi * f * x) * np.exp(-x * 260) + flt(noise(.035), 'highpass', 5000) * np.exp(-x * 500) * .5) * level


def blip(f0, d=.1, up=True):
    x = tt(d)
    f = f0 * (1 + (.55 if up else -.35) * (1 - np.exp(-x * 60)))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 40)


def whoosh(d=.45, f0=400, f1=7000, peak=.6):
    n = int(d * SR)
    out, src = np.zeros(n), noise(d)
    for i in range(0, n, 512):
        fc = f0 * (f1 / f0) ** (i / n)
        seg = src[i:i + 512]
        out[i:i + len(seg)] = flt(seg, 'bandpass', [fc * .7, min(fc * 1.4, SR / 2 - 100)], 1)
    x = np.arange(n) / n
    return out * np.where(x < peak, (x / peak) ** 2, ((1 - x) / (1 - peak)) ** 1.5)


def impact(d=1.4, body=1.0):
    x = tt(d)
    boom = np.sin(2 * np.pi * np.cumsum(42 + 70 * np.exp(-x * 14)) / SR) * np.exp(-x * 3.6)
    return np.tanh(1.4 * (boom + flt(noise(d), 'lowpass', 2600) * np.exp(-x * 10) * .5 * body))


def thud():
    x = tt(.4)
    return np.tanh(2.2 * (np.sin(2 * np.pi * np.cumsum(70 + 90 * np.exp(-x * 40)) / SR) * np.exp(-x * 14) + flt(noise(.4), 'lowpass', 1200) * np.exp(-x * 30) * .6))


def click():
    x = tt(.03)
    return np.sin(2 * np.pi * 2300 * x) * np.exp(-x * 400) + flt(noise(.03), 'highpass', 4000) * np.exp(-x * 600) * .6


# ---------------------------------------------------------------- music (A major, bars on the 2s grid)
CH = {'A': ['A2', 'C#4', 'E4', 'A4'], 'E': ['E2', 'B3', 'E4', 'G#4'], 'F#m': ['F#2', 'A3', 'C#4', 'F#4'], 'D': ['D2', 'A3', 'D4', 'F#4']}
ARP = {'A': ['A4', 'C#5', 'E5', 'A5'], 'E': ['G#4', 'B4', 'E5', 'G#5'], 'F#m': ['F#4', 'A4', 'C#5', 'F#5'], 'D': ['F#4', 'A4', 'D5', 'F#5']}
PROG = ['A', 'E', 'F#m', 'D']


def chord(t):
    return PROG[int(t // 2) % 4]


# Intro (0-2): marimba motif on 8ths, light ticks, building
motif = ['E5', 'A4', 'C#5', 'E5', 'A5', 'E5', 'C#5', 'B4']
for k, n in enumerate(motif * 2):
    t = k * B / 2
    if t < 1.75:
        put(marimba(hz(n)), t, .22 + .1 * (k / 16), -.3 + .6 * (k % 2))
for k in range(8):
    put(hat(), k * B / 2 + B / 4, .05 + .02 * k, .3)
put(kick(.6), 1.0, 1, 0, 'drums')
put(kick(.7), 1.5, 1, 0, 'drums')

# Groove: 2.0 -> 15, with a stop-time hole for the stamp (10.0-11.0) and a half-time manifesto
t = 2.0
while t < 14.99:
    stop = 10.0 <= t < 11.0
    half = 11.0 <= t < 13.5
    beat = int(round((t - 2.0) / B))
    if not stop:
        if not half or beat % 2 == 0:
            put(kick(), t, .95, 0, 'drums')
        if (beat % 2 == 1 and not half) or (half and beat % 4 == 2):
            put(clap(), t, .7, .05, 'drums')
        for s16 in range(4):
            if half and s16 % 2:
                continue
            put(hat(open_=(s16 == 2)), t + s16 * B / 4, [.11, .05, .13, .06][s16], .3 if s16 % 2 else -.25, 'drums')
        c = chord(t)
        for e in (0, 1):
            put(bass(hz(CH[c][0]), .22), t + e * B / 2, .5 if e else .32, 0, 'bass')
        if not half:
            put(stab([hz(n) for n in CH[c][1:]], .2), t + B / 2, .3, 0)
        for s16 in range(4):
            if half and s16 % 2:
                continue
            k = beat * 4 + s16
            put(pluck(hz(ARP[c][[0, 1, 2, 3, 2, 1, 3, 1][k % 8]]), .26, bright=.75), t + s16 * B / 4, .17, -.45 if k % 2 else .45)
    t += B
# build into the lockup, then a final chord
for i in range(8):
    put(clap(), 13.0 + i * B / 8 * 1.0, .12 + .05 * i, (-1) ** i * .2, 'drums')
put(stab([hz(n) for n in ['A3', 'C#4', 'E4', 'A4', 'C#5']], 1.6, 3400, 2.5), 14.0, .5, 0)
put(bass(hz('A1'), 1.0), 14.0, .7, 0, 'bass')
for i, n in enumerate(['A4', 'C#5', 'E5', 'A5', 'C#6']):
    put(pluck(hz(n), .9, bright=.9, decay=4), 14.0 + i * B / 4, .18, -.4 + .2 * i)

# ---------------------------------------------------------------- sound design on the events
for tw in ST['hookTimes']:
    put(tick(2400), tw, .32, -.1, 'fx')
put(blip(hz('E6')), EV['dotPop'], .35, 0, 'fx')
put(whoosh(.4, 300, 6000, .9), EV['iris1'][0] - .15, .55, 0, 'fx')
put(impact(1.2, .6), EV['drop'], .7, 0, 'fx')
for tw in EV['doesWords'] + EV['manifestoWords']:
    put(tick(2000), tw, .4, 0, 'fx')
for i, tc in enumerate(EV['cards']):
    put(whoosh(.3, 900, 5000, .5), tc - .05, .32, .5 - .25 * i, 'fx')
    put(blip(hz(['A5', 'C#6', 'E6', 'A6', 'C#7'][i]), .08), tc + .18, .18, .5 - .25 * i, 'fx')
put(whoosh(.4, 400, 5000, .6), EV['push'][0] - .05, .5, -.3, 'fx')
for k in range(5):
    put(tick(2200), EV['booksStart'] + k * .25, .3, 0, 'fx')
put(click(), EV['click'], 1.0, 0, 'fx')
put(blip(hz('A5'), .14), EV['click'] + .01, .4, 0, 'fx')
put(whoosh(.55, 200, 11000, .97), EV['whip'][0], .75, 0, 'fx')
put(impact(1.3, 1.0), EV['gridIn'], .8, 0, 'fx')
for i in range(4):
    put(blip(hz(['E5', 'A5', 'C#6', 'E6'][i]), .09), EV['gridIn'] + .06 * i + .1, .2, -.4 + .27 * i, 'fx')
put(pluck(hz('A5'), .6, idx=1.5, ratio=3.5, decay=5), EV['apptArrives'], .35, -.3, 'fx')
put(pluck(hz('E6'), .6, idx=1.5, ratio=3.5, decay=5), EV['apptArrives'] + .09, .3, -.3, 'fx')
for i in range(12):
    put(tick(1700 + 70 * i, .7), EV['countUp'][0] + i * (EV['countUp'][1] - EV['countUp'][0]) / 12, .25, .35, 'fx')
put(blip(hz('B6'), .07), EV['hover'], .2, -.2, 'fx')
put(impact(1.0, 1.4), EV['band'], .95, 0, 'fx')
put(whoosh(.25, 600, 9000, .4), EV['band'] - .05, .5, 0, 'fx')
put(thud(), EV['stampLand'], .9, 0, 'fx')
put(flt(noise(.3), 'bandpass', [2500, 6000]) * np.exp(-tt(.3) * 6) * .4, 10.6, .5, .3, 'fx')
put(impact(1.2, .7), 11.0, .7, 0, 'fx')
put(whoosh(.5, 300, 8000, .85), EV['iris2'][0] - .25, .55, 0, 'fx')
put(pluck(hz('A6'), 1.0, idx=1.2, ratio=3.0, decay=3), EV['logo'], .3, 0, 'fx')
put(blip(hz('C#6'), .12), EV['ctaPop'], .3, 0, 'fx')
put(click(), EV['ctaClick'], 1.0, 0, 'fx')
put(blip(hz('E6'), .1), EV['url'] + .05, .25, 0, 'fx')

# ---------------------------------------------------------------- mix
kenv = np.zeros(len(bus['bass']))
for t0 in np.arange(2.0, 15.0, B):
    if 10.0 <= t0 < 11.0:
        continue
    i, L = int(t0 * SR), int(.17 * SR)
    kenv[i:i + L] = np.maximum(kenv[i:i + L], np.linspace(1, 0, L))
bus['bass'] *= (1 - .65 * kenv)[:, None]
bus['music'] *= (1 - .3 * kenv)[:, None]
irL = int(1.2 * SR)
x = np.arange(irL) / SR
r2 = np.random.default_rng(4)
ir = np.stack([flt(r2.standard_normal(irL), 'lowpass', 7000) * np.exp(-x * 4.5) for _ in range(2)], 1)
ir /= np.sqrt((ir ** 2).sum(0, keepdims=True)) / .3
src = bus['music'] + bus['fx'] * .5
wet = np.stack([fftconvolve(src[:, c], ir[:, c])[:len(src)] for c in range(2)], 1)
mix = bus['drums'] * .9 + bus['bass'] * .9 + bus['music'] + bus['fx'] + wet * .25
mix = flt(mix, 'highpass', 30)[:N]
fn = int(.3 * SR)
mix[-fn:] *= np.linspace(1, 0, fn)[:, None]
mix /= np.abs(mix).max() / .7
sf.write(sys.argv[2], mix.astype(np.float32), SR, subtype='FLOAT')
print('ok')
