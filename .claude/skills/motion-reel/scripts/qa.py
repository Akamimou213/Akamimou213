"""QA helpers for qa.sh.
python3 -I qa.py corners film.mp4            corner boxes (8 % of each side) that differ from the frame's background -> labels/HUDs
python3 -I qa.py sync film.mp4 timeline.json nearest audio onset to every state change / hard cut / click, in ms"""
import json
import subprocess
import sys

import numpy as np


def frames(path, fps=2, w=320):
    info = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', path], capture_output=True, text=True).stdout
    W, H = map(int, info.strip().split(',')[:2]); h = round(w * H / W / 2) * 2
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-vf', f'fps={fps},scale={w}:{h}', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.float32)


def corners(path):
    F = frames(path); n, h, w = F.shape; bw, bh = int(w * .08), int(h * .08)
    worst = []
    for i, f in enumerate(F):
        bg = np.median(f)
        for name, box in (('TL', f[:bh, :bw]), ('TR', f[:bh, -bw:]), ('BL', f[-bh:, :bw]), ('BR', f[-bh:, -bw:])):
            busy = float((np.abs(box - bg) > 30).mean())
            if busy > .02: worst.append((busy, i / 2, name))
    if not worst: print('corners clean'); return
    worst.sort(reverse=True)
    print(f'{len(worst)} busy corner samples; worst:', ', '.join(f'{c} at {t:.1f}s ({b:.0%})' for b, t, c in worst[:6]))
    print('(a full-bleed image or map in a corner is fine; text, logos, timecodes or frames are not)')


def sync(path, tl_path):
    import librosa
    TL = json.load(open(tl_path)); fps = TL.get('fps', 60)
    wav = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', '22050', '-f', 'f32le', '-'], capture_output=True).stdout
    y = np.frombuffer(wav, np.float32)
    on = librosa.onset.onset_detect(y=y, sr=22050, units='time', backtrack=False)
    ev = TL.get('events', {})
    marks = sorted(set([k['t'] for k in TL.get('keys', []) + TL.get('scenes', [])] + TL.get('hardCuts', []) + ev.get('clicks', [])))
    marks = [m for m in marks if 0 < m < TL['duration']]
    if not len(on) or not marks: print('nothing to compare'); return
    d = [(m, 1000 * (on[np.abs(on - m).argmin()] - m)) for m in marks]
    frame_ms = 1000 / min(fps, 30)
    bad = [(m, e) for m, e in d if abs(e) > frame_ms]
    print(f'{len(marks)} marks, median |offset| {np.median([abs(e) for _, e in d]):.0f} ms, max {max(abs(e) for _, e in d):.0f} ms (target <= {frame_ms:.0f} ms)')
    for m, e in bad[:10]: print(f'  off grid: {m:.2f}s nearest onset {e:+.0f} ms')
    if bad: print('  (review, not auto-fail: settle pops land ~100 ms after a morph by design)')


if __name__ == '__main__':
    {'corners': lambda: corners(sys.argv[2]), 'sync': lambda: sync(sys.argv[2], sys.argv[3])}[sys.argv[1]]()
