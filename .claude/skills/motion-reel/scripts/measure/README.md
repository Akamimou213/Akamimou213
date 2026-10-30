# Measure motion in a recording

Turns a recording of real motion (the client's UI captured with `capture.cjs record`, a screen recording of their app, or
a reference video) into spring and easing numbers for `Motion.spring(t, k, d)` / `track`, so we match motion by measurement,
not by eye.

Vendored unchanged from [mblode/agent-skills `ui-animation`](https://github.com/mblode/agent-skills/tree/5a781a88ed60c1033767b6b6a966887cd93dd912/skills/ui-animation)
(MIT, Matthew Blode, `LICENSE.vendored`), via the copy in nexu-io/open-design at `12d970e`. `references/` holds its notes on
reading the output; mentions of "SKILL.md" there mean the upstream skill, not ours. Needs ffmpeg, numpy, scipy and
`opencv-python-headless` (pinned in `motion-studio/requirements.txt`).

```bash
M=.claude/skills/motion-reel/scripts/measure
python3 -I $M/extract_frames.py rec.mp4 docs/measure/open --fps 60 --start 2.40 --duration 0.8   # trim to one transition
python3 -I $M/track_motion.py docs/measure/open [--bbox X,Y,W,H]                                  # one element per run
python3 -I $M/fit_curves.py docs/measure/open/metrics.json --fps 60                              # --fps = extraction fps
```

`fit_curves.py` reports, per property (translate, scaleX, scaleY, opacity, blur, radius), a spring with `stiffness` and
`damping` at mass 1 (these are our `k` and `d`, so `spring(t, stiffness, damping)` replays it) and a cubic-bezier, each with a
normalized RMS error: under 0.03 use it directly; 0.03–0.08 check it against the contact sheet; above 0.08 the motion is
usually multi-phase, so split it at the phase boundary and fit each part.

**Start the window on an empty frame.** The tracker takes the first frame as background and finds the element by difference.
Checked on a synthetic clip (springs we set, 60 fps): starting on an empty frame it returned k 170.4 / d 20.04 for a true
170 / 20 and 299.3 / 14.01 for 300 / 14; with the element already on screen in frame 0 it returned 235 / 25 and 370 / 15.
If the element never leaves, use `--bbox` around its path and a window that starts just before it moves, and treat the
numbers as a first guess.

Also read off the timeline, not just the curves: which property starts first and when each settles (`references/choreography.md`).
Fit open and close as separate clips; they're almost never mirror images. Measure motion; never copy content: the reference
rules in `SKILL.md` still apply.
