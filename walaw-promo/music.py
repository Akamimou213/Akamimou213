"""Original 20s track at 120 BPM, synthesized in numpy, with UI sound design locked to timeline.json events.
Usage: python3 -I music.py timeline.json out.wav"""
import json
import sys

import numpy as np
import soundfile as sf
from scipy.signal import butter, fftconvolve, sosfilt

TL = json.load(open(sys.argv[1]))
EV = TL['events']
SR, DUR = 44100, 20.0
N = int(SR * DUR)
BEAT = 60 / TL['bpm']
rng = np.random.default_rng(120)
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
    name, octv = n[:-1], int(n[-1])
    return 440 * 2 ** ((12 * (octv + 1) + NOTE[name] - 69) / 12)


# ---------------------------------------------------------------- instruments
def kick(level=1.0):
    x = tt(.4)
    s = np.sin(2 * np.pi * np.cumsum(48 + 110 * np.exp(-x * 30)) / SR) * np.exp(-x * 7.5)
    s += noise(.4) * np.exp(-x * 400) * .25
    return np.tanh(1.6 * s) * level


def clap():
    x = tt(.3)
    env = sum((x >= o) * np.exp(-np.clip(x - o, 0, None) * 130) for o in (0, .01, .021)) + .55 * np.exp(-x * 15)
    return flt(noise(.3), 'bandpass', [900, 5000]) * env * .55


def hat(open_=False):
    d = .16 if open_ else .045
    return flt(noise(d), 'highpass', 7500) * np.exp(-tt(d) * (22 if open_ else 90))


def fm_pluck(f, d=.32, idx=3.2, ratio=2.0, bright=1.0):
    x = tt(d)
    I = idx * bright * np.exp(-x * 11) + .25
    s = np.sin(2 * np.pi * f * x + I * np.sin(2 * np.pi * f * ratio * x))
    return s * np.exp(-x * 8) * np.minimum(1, x / .002)


def saw(f, d):
    x = tt(d)
    return 2 * ((f * x) % 1) - 1


def stab(freqs, d=.2, cutoff=2600):
    out = np.zeros(int(d * SR))
    for f in freqs:
        for det in (-.006, -.002, .002, .006):
            out += saw(f * (1 + det), d)
    out = flt(out / (len(freqs) * 4), 'lowpass', cutoff)
    x = tt(d)
    return out * np.exp(-x * 9) * np.minimum(1, x / .004)


def bass_note(f, d):
    x = tt(d)
    sq = np.sign(np.sin(2 * np.pi * f * x)) * .45 + np.sin(2 * np.pi * f / 2 * x) * .8
    return flt(sq, 'lowpass', 420) * np.minimum(1, x / .004) * np.exp(-x * 2.5)


def blip(f0, d=.09, up=True, level=1.0):
    x = tt(d)
    f = f0 * (1 + (.5 if up else -.35) * (1 - np.exp(-x * 60)))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 45) * level


def click():
    x = tt(.03)
    return (np.sin(2 * np.pi * 2300 * x) * np.exp(-x * 400) + flt(noise(.03), 'highpass', 4000) * np.exp(-x * 600) * .6) * .9


def whoosh(d=.45, f0=400, f1=6000, peak=.6):
    """Noise through a bandpass that sweeps; amplitude swells to `peak` of the duration then falls."""
    n = int(d * SR)
    out = np.zeros(n)
    src = noise(d)
    chunk = 512
    for i in range(0, n, chunk):
        u = i / n
        fc = f0 * (f1 / f0) ** u
        seg = src[i:i + chunk]
        out[i:i + len(seg)] = flt(seg, 'bandpass', [fc * .7, min(fc * 1.4, SR / 2 - 100)], 1)
    x = np.arange(n) / n
    env = np.where(x < peak, (x / peak) ** 2, ((1 - x) / (1 - peak)) ** 1.5)
    return out * env


def impact():
    x = tt(1.6)
    boom = np.sin(2 * np.pi * np.cumsum(40 + 70 * np.exp(-x * 14)) / SR) * np.exp(-x * 3.5)
    crack = flt(noise(1.6), 'lowpass', 3000) * np.exp(-x * 9) * .5
    return np.tanh(1.4 * (boom + crack))


def ringback(d=.42):
    x = tt(d)
    s = (np.sin(2 * np.pi * 440 * x) + np.sin(2 * np.pi * 480 * x)) * .5
    s = flt(s, 'bandpass', [300, 3400])
    return s * np.minimum(1, x / .01) * np.minimum(1, (d - x) / .02)


# ---------------------------------------------------------------- arrangement
CH = {'G': ['G2', 'G3', 'B3', 'D4'], 'D': ['D2', 'F#3', 'A3', 'D4'], 'Em': ['E2', 'G3', 'B3', 'E4'], 'C': ['C2', 'G3', 'C4', 'E4'],
      'Dsus': ['D2', 'G3', 'A3', 'D4']}
ARP = {'G': ['G4', 'B4', 'D5', 'G5'], 'D': ['F#4', 'A4', 'D5', 'F#5'], 'Em': ['E4', 'G4', 'B4', 'E5'], 'C': ['E4', 'G4', 'C5', 'E5'], 'Dsus': ['G4', 'A4', 'D5', 'G5']}
PLAN = [(3, 5, 'G'), (5, 7, 'D'), (7, 9, 'Em'), (9, 11, 'C'), (11, 13, 'G'), (13, 13.5, 'D'), (13.5, 14.5, 'Dsus'),
        (14.5, 15.5, 'Em'), (15.5, 16.5, 'C'), (16.5, 18, 'G'), (18, 19, 'D'), (19, 20, 'G')]


def chord_at(t):
    for a, b, c in PLAN:
        if a <= t < b:
            return c
    return None


# Hook: tension in E minor, the phone rings, then nobody answers.
for k in range(4):
    put(fm_pluck(hz(['E4', 'G4', 'B4', 'E5'][k % 4]), .5, idx=1.2, bright=.5), k * .5, .16, -.3 + .2 * k)
for t0 in EV['ring']:
    put(ringback(), t0, .5, 0, 'fx')
for t0 in (0.0, 1.0):
    put(kick(.55), t0, 1, 0, 'drums')
put(bass_note(hz('E1'), 1.9), 0.0, .6, 0, 'bass')
for i, t0 in enumerate(EV['hookWords']):
    put(click(), t0, .35, 0, 'fx')
x = tt(.32)
put(np.sin(2 * np.pi * 1000 * x) * np.minimum(1, x / .005) * np.minimum(1, (.32 - x) / .01), EV['voicemailBeep'], .32, 0, 'fx')
put(whoosh(.7, 300, 9000, .95), EV['riser'][0], .55, 0, 'fx')

# Groove from the drop.
t = 3.0
while t < 20 - 1e-6:
    sec_break = 13.5 <= t < 14.5
    beat_i = int(round((t - 3.0) / BEAT))
    if not sec_break and t < 19.5:
        put(kick(), t, .95, 0, 'drums')
        if beat_i % 2 == 1:
            put(clap(), t, .7, .05, 'drums')
    if sec_break:
        put(kick(.6), t, .9, 0, 'drums')
    for s16 in range(4):
        th = t + s16 * BEAT / 4
        if th >= 19.5 or sec_break:
            continue
        put(hat(open_=(s16 == 2)), th, [.12, .06, .14, .07][s16], .3 if s16 % 2 else -.25, 'drums')
    t += BEAT

# Bass: offbeat 8ths, ducked under the kick.
t = 3.0
while t < 19.5:
    c = chord_at(t)
    root = hz(CH[c][0])
    for e in (0, 1):
        th = t + e * BEAT / 2
        if 13.5 <= th < 14.5:
            put(bass_note(root, .24), th, .35, 0, 'bass')
        else:
            put(bass_note(root, .22), th, .55 if e else .35, 0, 'bass')
    t += BEAT

# Plucked arpeggio (16ths) and offbeat chord stabs.
t, k = 3.0, 0
while t < 19.0:
    c = chord_at(t)
    notes = ARP[c] + [ARP[c][2]]
    if not (13.5 <= t < 14.5):
        f = hz(notes[[0, 1, 2, 3, 2, 1, 4, 1][k % 8]])
        put(fm_pluck(f, .28, bright=.7 + .3 * ((k % 4) == 0)), t, .2, -.45 if k % 2 else .45)
    if (k % 4) == 2 and not (13.5 <= t < 14.5):
        put(stab([hz(n) for n in CH[c][1:]], .22), t, .35, 0)
    t += BEAT / 4
    k += 1

# Metric build: rising ticks that follow the counter, then the landing.
for i in range(26):
    y = (i + 1) / 27
    tick_t = EV['metricCount'][0] + (EV['metricCount'][1] - EV['metricCount'][0]) * (-np.log2(1 - y) / 10)
    put(blip(900 + i * 45, .05), tick_t, .22, .2 * np.sin(i), 'fx')
put(whoosh(.9, 200, 7000, .97), EV['metricCount'][1] - .9, .4, 0, 'fx')

# Ending: final chord with a little pluck flourish.
put(stab([hz(n) for n in ['G3', 'B3', 'D4', 'G4']], 1.4, 3200), 19.0, .55, 0)
for i, n in enumerate(['G4', 'B4', 'D5', 'G5', 'B5']):
    put(fm_pluck(hz(n), .9, bright=.9), 19.0 + i * BEAT / 4, .2, -.4 + .2 * i)
put(bass_note(hz('G1'), 1.0), 19.0, .7, 0, 'bass')
put(kick(), 19.0, 1.0, 0, 'drums')

# ---------------------------------------------------------------- UI sound design on the beat
for t0 in EV['impacts']:
    put(impact(), t0, .85, 0, 'fx')
for i, t0 in enumerate(EV['assemble']):
    put(blip(hz(['D5', 'G5', 'A5', 'B5', 'D6', 'G6'][i]), .12), t0, .3, -.3 + .12 * i, 'fx')
for i in range(10):
    put(blip(1400 + 90 * i, .04), EV['waveBars'][0] + i * (EV['waveBars'][1] - EV['waveBars'][0]) / 10, .12, -.5 + .1 * i, 'fx')
for i in range(6):
    put(click(), EV['headlineWords'] + i * .0625, .18, 0, 'fx')
for t0 in EV['whooshes']:
    put(whoosh(.45, 500, 7000, .6), t0 - .2, .45, 0, 'fx')
for t0 in EV['clicks']:
    put(click(), t0, 1.0, 0, 'fx')
    put(blip(hz('G5'), .15, level=.5), t0 + .01, .4, 0, 'fx')
for t0 in EV['hovers']:
    put(blip(hz('D6'), .07, level=.6), t0, .25, .3, 'fx')
ding = fm_pluck(hz('G5'), .6, idx=1.5, ratio=3.5)
put(ding, EV['apptArrives'], .35, .2, 'fx')
put(fm_pluck(hz('D6'), .6, idx=1.5, ratio=3.5), EV['apptArrives'] + .09, .3, .3, 'fx')
for i in range(12):
    put(blip(1700 + 60 * i, .03), EV['countUp'][0] + i * (EV['countUp'][1] - EV['countUp'][0]) / 12, .14, .25, 'fx')
for t0 in EV['metricLines'] + EV['ctaPops']:
    put(blip(hz('B5'), .1), t0, .3, 0, 'fx')

# ---------------------------------------------------------------- mix
kick_env = np.zeros(len(bus['bass']))
for t0 in np.arange(3.0, 19.5, BEAT):
    i = int(t0 * SR)
    L = int(.18 * SR)
    kick_env[i:i + L] = np.maximum(kick_env[i:i + L], 1 - np.linspace(1, 0, L) ** 2 * 0 - np.linspace(1, 0, L))
duck = 1 - .65 * kick_env
bus['bass'] *= duck[:, None]
bus['music'] *= (1 - .35 * kick_env)[:, None]
ir_len = int(1.3 * SR)
x = np.arange(ir_len) / SR
r2 = np.random.default_rng(3)
ir = np.stack([flt(r2.standard_normal(ir_len), 'lowpass', 7000) * np.exp(-x * 4.2) for _ in range(2)], 1)
ir /= np.sqrt((ir ** 2).sum(0, keepdims=True)) / .3
wet_src = bus['music'] + bus['fx'] * .6
wet = np.stack([fftconvolve(wet_src[:, c], ir[:, c])[:len(wet_src)] for c in range(2)], 1)
mix = bus['drums'] * .9 + bus['bass'] * .9 + bus['music'] + bus['fx'] + wet * .28
mix = flt(mix, 'highpass', 30)[:N]
fade = np.ones(N)
fn = int(.25 * SR)
fade[-fn:] = np.linspace(1, 0, fn)
mix *= fade[:, None]
mix /= np.abs(mix).max() / .7
sf.write(sys.argv[2], mix.astype(np.float32), SR, subtype='FLOAT')
print('ok', mix.shape)
