"""Check that every sound cue is audible on its interaction frame in an exported film.
Usage: python3 -I scripts/cue-check.py out/preview.mp4
Reads the cue list (frame, sfx) from src/content/timeline.ts and each WAV's length from public/sfx/.
Uses the left channel (a stereo-to-mono downmix would add 3 dB). For each cue, finds the first sample above -40 dBFS at or after max(cue - 1 frame, end of the previous cue's file)
and reports the offset in frames. Target: |offset| < 1 frame."""
import re
import subprocess
import sys
import wave

import numpy as np

SR, FPS, THR_DB = 48000, 30, -40
src = open('src/content/timeline.ts', encoding='utf8').read()
T = {k: [int(x) for x in re.findall(r'-?\d+', v)]
     for k, v in re.findall(r'(\w+): (\[[^\]]*\]|\{[^}]*\}|-?\d+)', src.split('export const T = {')[1].split('} as const;')[0])}
cue_src = src.split('export const CUES')[1]
cues = []
for frame_expr, sfx in re.findall(r'frame: ([^,]+), sfx: "(\w+)"', cue_src):
    key, idx = re.match(r'T\.(\w+)(?:\[(\d)\]|\.(?:in))?', frame_expr).group(1, 2)
    cues.append((T[key][int(idx) if idx else 0], sfx))
dur = {}
for _, sfx in cues:
    with wave.open(f'public/sfx/{sfx}.wav') as w:
        dur[sfx] = w.getnframes() / w.getframerate()

raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', sys.argv[1], '-af', 'pan=mono|c0=c0', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
y = np.abs(np.frombuffer(raw, np.float32))
thr = 10 ** (THR_DB / 20)
prev_end, worst = 0.0, 0.0
for frame, sfx in cues:
    t0 = frame / FPS
    start = int(max(t0 - 1 / FPS, prev_end) * SR)
    hits = np.flatnonzero(y[start:start + int(0.5 * SR)] > thr)
    if not len(hits):
        print(f'cue {sfx:<8} frame {frame:3d}: NOT FOUND above {THR_DB} dBFS within 0.5 s')
        worst = float('inf')
    else:
        f = (start + hits[0]) / SR * FPS
        worst = max(worst, abs(f - frame))
        peak = 20 * np.log10(y[start:start + int(dur[sfx] * SR)].max())
        print(f'cue {sfx:<8} frame {frame:3d}: audible at frame {f:7.2f} (offset {f - frame:+.2f}), peak in cue {peak:6.1f} dBFS')
    prev_end = t0 + dur[sfx]
print(f'{len(cues)} cues; worst offset {worst:.2f} frames (target < 1)')
