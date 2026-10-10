"""QA helpers for qa.sh.
python3 -I qa.py corners film.mp4            corner boxes (8 % of each side) that stay busy for >= 1 s -> labels/HUDs (transitions pass)
python3 -I qa.py sync film.mp4 timeline.json nearest audio onset to every state change / hard cut / click, in ms (up to 3 frames early is fine)"""
import json
import subprocess
import sys

import numpy as np


def frames(path, fps=2, w=320):
    info = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', path], capture_output=True, text=True).stdout
    W, H = map(int, info.strip().split(',')[:2]); h = round(w * H / W / 2) * 2
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-vf', f'fps={fps},scale={w}:{h}', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.float32)


def corners(path, fps=2, hold=1.0):
    F = frames(path, fps); n, h, w = F.shape; bw, bh = int(w * .08), int(h * .08)
    busy = {c: [] for c in ('TL', 'TR', 'BL', 'BR')}
    for f in F:
        bg = np.median(f)
        for name, box in (('TL', f[:bh, :bw]), ('TR', f[:bh, -bw:]), ('BL', f[-bh:, :bw]), ('BR', f[-bh:, -bw:])):
            busy[name].append(float((np.abs(box - bg) > 30).mean()) > .02)
    # labels, HUDs and frames persist; an iris or a cut crosses a corner for a few samples only
    need, runs = max(2, round(hold * fps)), []
    for name, b in busy.items():
        i = 0
        while i < len(b):
            if not b[i]: i += 1; continue
            j = i
            while j < len(b) and b[j]: j += 1
            if j - i >= need: runs.append((name, i / fps, j / fps))
            i = j
    if not runs: print(f'corners clean (nothing busy for >= {hold:g} s)'); return
    print(f'{len(runs)} corner(s) busy for >= {hold:g} s:', ', '.join(f'{c} {a:.1f}-{b:.1f}s' for c, a, b in runs[:8]))
    print('(a full-bleed image or map in a corner is fine; text, logos, timecodes or frames are not)')


def sync(path, tl_path):
    import librosa
    TL = json.load(open(tl_path)); fps = TL.get('fps', 60)
    wav = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', '22050', '-f', 'f32le', '-'], capture_output=True).stdout
    y = np.frombuffer(wav, np.float32)
    on = librosa.onset.onset_detect(y=y, sr=22050, hop_length=128, units='time', backtrack=False)   # ~6 ms resolution
    ev = TL.get('events', {})
    marks = sorted(set([k['t'] for k in TL.get('keys', []) + TL.get('scenes', [])] + TL.get('hardCuts', []) + ev.get('clicks', [])))
    marks = [m for m in marks if 0 < m < TL['duration']]
    if not len(on) or not marks: print('nothing to compare'); return
    d = [(m, 1000 * (on[np.abs(on - m).argmin()] - m)) for m in marks]
    # sound may lead the picture by up to 3 frames (early reads as synced, late reads as broken); never trail it by more than 1
    frame_ms = 1000 / fps; early, late = 3 * frame_ms, frame_ms
    bad = [(m, e) for m, e in d if e < -early or e > late]
    print(f'{len(marks)} marks, median |offset| {np.median([abs(e) for _, e in d]):.0f} ms, max {max(abs(e) for _, e in d):.0f} ms (target -{early:.0f} to +{late:.0f} ms)')
    for m, e in bad[:10]: print(f'  off grid: {m:.2f}s nearest onset {e:+.0f} ms')
    if bad: print('  (review, not auto-fail: settle pops land ~100 ms after a morph by design)')


if __name__ == '__main__':
    {'corners': lambda: corners(sys.argv[2]), 'sync': lambda: sync(sys.argv[2], sys.argv[3])}[sys.argv[1]]()
