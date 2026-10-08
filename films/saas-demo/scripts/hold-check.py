"""Stillness checks on lossless frames (H.264 adds edge noise, so the MP4 is not used for this).
Render the frames first:
  npx remotion render SaaSDemo out/frames --sequence --image-format=png
then:
  python3 -I scripts/hold-check.py out/frames
Each check compares every frame in a range with the range's first frame, inside a region (1920x1080 px),
and counts pixels that differ by more than TOL/255. TOL = 2 ignores compositor antialiasing jitter (invisible)."""
import subprocess
import sys

import numpy as np

W, H, TOL = 1920, 1080, 2
d = sys.argv[1]


def load(i):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'{d}/element-{i:03d}.png', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'],
                         capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(H, W).astype(np.int16)


def still(name, a, b, box=(0, 0, W, H)):
    x0, y0, x1, y1 = box
    ref = load(a)[y0:y1, x0:x1]
    worst, at, peak = 0, a, 0
    for i in range(a, b + 1):
        diff = np.abs(load(i)[y0:y1, x0:x1] - ref)
        n = int((diff > TOL).sum())
        if n > worst:
            worst, at = n, i
        peak = max(peak, int(diff.max()))
    verdict = 'STILL' if worst == 0 else 'MOVES'
    print(f'{name:<34} frames {a:3d}-{b:3d}: {worst:6d} px change > {TOL}/255 (worst frame {at}, max delta {peak}) -> {verdict}')


# Ranges follow src/content/timeline.ts: a headline is fully in 12 frames after T.*.in and starts leaving at T.*.out.
# Boxes cover the glyphs only (the headline column ends at x 640; card A's shadow reaches x 643).
still('headline 1 read hold', 24, 191, (100, 330, 640, 680))
still('headline 2 read hold', 240, 343, (100, 330, 640, 660))
still('support line read hold', 258, 343, (100, 660, 640, 800))
still('end card + whole frame, final hold', 360, 449)
still('concept label, all 450 frames', 0, 449, (78, 54, 615, 106))
