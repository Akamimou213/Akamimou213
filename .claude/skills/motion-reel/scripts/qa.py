"""QA helpers for qa.sh.
python3 -I qa.py corners film.mp4            corner boxes (8 % of each side) that stay busy for >= 1 s -> labels/HUDs (transitions pass)
python3 -I qa.py sync film.mp4 timeline.json nearest audio onset to every state change / hard cut / click, in ms (up to 3 frames early is fine)
python3 -I qa.py motion film.mp4 [timeline.json] frame 0 (it's the muted-autoplay thumbnail), one-frame flashes and jumps, dead stretches
                                             > 2.2 s (unless listed in timeline "holds" or the final hold), loop seam position + velocity
python3 -I qa.py static <project dir>        engine code that breaks determinism: Math.random, Date.now, timers, rAF, CSS transitions"""
import re
import json
import subprocess
import sys

import numpy as np


def frames(path, fps=2, w=320):
    info = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', path], capture_output=True, text=True).stdout
    W, H = map(int, info.strip().split(',')[:2]); h = round(w * H / W / 2) * 2
    vf = f'fps={fps},scale={w}:{h}' if fps else f'scale={w}:{h}'
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-vf', vf, '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], capture_output=True).stdout
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
    on = librosa.onset.onset_detect(y=y, sr=22050, hop_length=128, units='time', backtrack=True)    # ~6 ms resolution; backtrack to the energy rise, not the flux peak
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


def motion(path, tl_path=None, still=.12, dead=2.2):
    TL = json.load(open(tl_path)) if tl_path else {}
    rate = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=r_frame_rate', '-of', 'csv=p=0', path], capture_output=True, text=True).stdout.strip()
    fps = eval(rate) if re.fullmatch(r'\d+/\d+|\d+', rate) else TL.get('fps', 60)
    F = frames(path, None, 160); n = len(F)
    d = np.r_[0, np.abs(np.diff(F, axis=0)).mean((1, 2))]          # mean |change| per frame, 0..255
    out = []
    if F[0].std() < 4: out.append(f'frame 0 is flat ({F[0].mean():.0f}/255): it is the thumbnail on muted autoplay, so open on a picture')
    cuts = set(round(c * fps) for c in TL.get('hardCuts', []))
    for i in range(1, n - 1):
        loc = max(np.median(d[max(1, i - 15):i + 15]), .5)
        skip = np.abs(F[i + 1] - F[i - 1]).mean()
        if d[i] > 4 * loc and d[i + 1] > 4 * loc and skip < .5 * min(d[i], d[i + 1]) and d[i] > 3:
            out.append(f'one-frame flash at {i / fps:.2f}s (frame {i} differs from both neighbours, which match each other)')
        elif d[i] > 6 and d[i] > 3 * d[i - 1] and d[i] > 3 * d[i + 1] and not any(abs(i - c) <= 1 for c in cuts):
            out.append(f'jump at {i / fps:.2f}s: a one-frame change {d[i]:.1f} vs {d[i - 1]:.1f}/{d[i + 1]:.1f} around it (missing in-between or a stray hard cut)')
    holds = [(a, b) for a, b, *_ in TL.get('holds', [])]
    run = 0
    for i in range(1, n + 1):
        if i < n and d[i] < still: run += 1; continue
        if run / fps > dead:
            a, b = (i - run) / fps, i / fps
            final = i == n
            if not final and not any(ha <= a + .1 and b <= hb + .1 for ha, hb in holds):
                out.append(f'dead stretch {a:.2f}-{b:.2f}s ({b - a:.1f}s with nothing moving): add life or list it in timeline "holds" with a reason')
        run = 0
    rest = float((d[1:] < still).mean())
    if TL.get('loop'):
        seam, near = np.abs(F[0] - F[-1]).mean(), np.median(np.r_[d[1:6], d[-5:]])
        if seam > 2 * max(near, .3): out.append(f'loop seam jumps: last->first change {seam:.2f} vs {near:.2f} per frame around it (position or velocity breaks)')
    print(f'{n} frames at {fps:g} fps, still {rest:.0%} of the time (threshold {still}/255 per frame)')
    print('\n'.join('  ' + o for o in out[:20]) if out else '  clean: no flat frame 0, flashes, jumps or dead stretches')


def static(project):
    pat = re.compile(r'Math\.random|Date\.now|performance\.now|new Date\(|setTimeout|setInterval|requestAnimationFrame|AnalyserNode|transition\s*:|animation\s*:')
    hits = []
    for root, dirs, files in __import__('os').walk(project):
        dirs[:] = [x for x in dirs if x not in ('node_modules', 'out', '.git', 'assets')]
        for f in files:
            if f.endswith(('.html', '.js', '.mjs', '.css')) and not f.startswith('motion.js'):
                for k, line in enumerate(open(__import__('os').path.join(root, f), errors='ignore'), 1):
                    code = line.split('//')[0]
                    if pat.search(code): hits.append(f'{f}:{k}: {line.strip()[:110]}')
    print('\n'.join(['nondeterministic code (derive everything from t; use Motion.rng/hash):'] + ['  ' + h for h in hits[:30]]) if hits else 'static: clean (no random, clocks, timers, rAF or CSS animation in the engine)')


if __name__ == '__main__':
    {'corners': lambda: corners(sys.argv[2]), 'sync': lambda: sync(sys.argv[2], sys.argv[3]),
     'motion': lambda: motion(sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else None), 'static': lambda: static(sys.argv[2])}[sys.argv[1]]()
