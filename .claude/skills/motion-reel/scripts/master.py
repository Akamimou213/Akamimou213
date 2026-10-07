"""Mix stems and master transparently: look-ahead peak limiter (no dynamic loudness riding) to a LUFS target, 48 kHz.
Usage: python3 -I master.py out.wav music.wav:1.0 sfx.wav:0.8 [--duration 20] [--lufs -14] [--loop]
ffmpeg loudnorm in dynamic mode rode a piano score's dynamics (LRA 9.6 -> 5.7 LU); this keeps LRA intact."""
import argparse
import re
import subprocess
from math import gcd

import numpy as np
import soundfile as sf
from scipy.ndimage import minimum_filter1d, uniform_filter1d
from scipy.signal import resample_poly

ap = argparse.ArgumentParser()
ap.add_argument('out'); ap.add_argument('stems', nargs='+', help='file.wav[:gain]')
ap.add_argument('--duration', type=float); ap.add_argument('--lufs', type=float, default=-14.0)
ap.add_argument('--loop', action='store_true', help='seamless loop: no end fade')
ap.add_argument('--ceiling', type=float, default=-2.0, help='sample ceiling dBFS; headroom for true peak + AAC')
args = ap.parse_args()
SR = 48000


def load(spec):
    p, _, gain = spec.partition(':')
    x, sr = sf.read(p, always_2d=True)
    if sr != SR: g = gcd(SR, sr); x = resample_poly(x, SR // g, sr // g, axis=0)
    if x.shape[1] == 1: x = np.repeat(x, 2, 1)
    return x[:, :2] * float(gain or 1)


stems = [load(s) for s in args.stems]
n = int(args.duration * SR) if args.duration else max(len(s) for s in stems)
x = np.zeros((n, 2))
for s in stems: x[:min(n, len(s))] += s[:n]
if not args.loop: fade = int(.004 * SR); x[-fade:] *= np.linspace(1, 0, fade)[:, None]   # no click at the very end
CEIL = 10 ** (args.ceiling / 20)


def limit(y):
    need = np.minimum(1, CEIL / np.maximum(np.abs(y).max(1), 1e-9))
    g = need
    for radius_ms in (4, 45):                     # fast catch, then slow release
        r = int(radius_ms / 1000 * SR)
        g = uniform_filter1d(minimum_filter1d(g, 2 * r + 1), r)
    return y * np.minimum(g, need)[:, None], g


def measure(path):
    out = subprocess.run(['ffmpeg', '-hide_banner', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    s = out[out.rfind('Summary'):]
    f = lambda pat: float(re.search(pat, s).group(1))
    return f(r'I:\s+(-?[\d.]+) LUFS'), f(r'LRA:\s+([\d.]+) LU'), f(r'Peak:\s+(-?[\d.]+) dBFS')


gain_db = 0.0
for it in range(6):
    y, g = limit(x * 10 ** (gain_db / 20))
    sf.write(args.out, y.astype(np.float32), SR, subtype='PCM_24')
    I, lra, tp = measure(args.out)
    print(f'iter {it}: gain {gain_db:+.2f} dB -> {I} LUFS, LRA {lra} LU, true peak {tp} dBTP, max GR {-20 * np.log10(g.min()):.1f} dB')
    if abs(I - args.lufs) < .15: break
    gain_db += args.lufs - I
