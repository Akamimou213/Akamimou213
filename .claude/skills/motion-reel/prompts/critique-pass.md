# Critique pass

Run `scripts/qa.sh out/<file>.mp4` (or render stills), then open `contact.png`, `strip.png` and `phone.png`
and look at them properly. Be a harsh motion director, not a proud author.

## Score 1–10
- Hook in the first 2 s
- Readability at phone size (360 px wide)
- Motion quality (springs with a hair of overshoot, no dead frames, no sliding)
- Variety (a new thing every 2–4 s; something on every beat)
- Composition (fills the frame per format; room for text)
- Brand accuracy (colours, font, logo, real UI, verbatim copy)
- Sound sync (cuts and accents on the grid; onsets within a frame)

## Hunt specifically for
- text overlapping during swaps; content visible while its container is mid-morph
- anything sliding linearly instead of easing; restarts instead of summed springs
- corner labels, HUDs, timecodes, frame borders; centered title on a gradient
- blurry scaled text or upscaled captures
- a dead beat with nothing happening
- ghost/grey frames at hard cuts (subframes straddling a cut)
- a stutter at the loop seam (first vs last frame SSIM < 0.99)
- invented data, placeholder text, a cursor doing something the real UI can't do

## Output (append to docs/review_log.md)
```
Round N — <date>
Scores: hook 8 · readability 7 · motion 8 · variety 9 · composition 7 · brand 9 · sync 8
Worst 3:
1. [t=4.20s] <problem> → <fix>
2. [t=9.90s] <problem> → <fix>
3. [t=13.5s] <problem> → <fix>
```
Fix them, re-render only the affected seconds, show the new contact sheet and new scores. Stop at all 8+.
