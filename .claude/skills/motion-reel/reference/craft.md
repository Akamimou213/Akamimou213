# Craft numbers

Defaults, not laws: break one when the film needs it, and say why in `docs/review_log.md`. Each rule is checked in rendered
frames, not in parameters. Sources are the repos vetted in `repos.md` (ideas paraphrased; nothing copied from repos without
a licence). "Tool" says where the skill enforces or measures the rule.

## Timing

| Element | Duration |
|---|---|
| Micro (tick, caret, small pop) | 120–240 ms |
| Small element (chip, icon, word) | 320–480 ms |
| Card / panel | 560–880 ms |
| Scene change | 800–1200 ms |
| Camera move | 1.6–3.6 s |

- Exits take 60–75 % of their entrance. Sibling staggers 50–120 ms; a whole stagger finishes within 500 ms, as one phrase.
- Enter from scale 0.90–0.97, never from 0. Longer travel takes longer: ~1.3× for 200 px, 1.8–2× for a full frame vs a 50 px move.
- **Reading holds.** A line stays readable for at least `max(0.7 s, 0.25 s + characters / 17)`. A hero line read cold needs
  `0.3 s × words + 1.5 s`. The final hook or CTA holds ≥ 2 s; an ad end card holds ≥ 3 s. Add up the holds against the
  duration at G4: if they don't fit, cut words, not hold time.
- **Stillness before the climax:** 0.3–0.75 s of near-stillness, then the hit. The payoff holds ≥ 1 s. A stamp or slam lands
  0.10–0.25 s after its target is fully visible.
- **No frozen frames** except the final hold. A stretch with nothing moving longer than 2.2 s needs a reason in timeline
  `holds: [[t0, t1, "reason"]]`. Tool: `qa.py motion`. Holds still keep something small alive.
- Overlap scenes: a hard gap reads as loading. The next shot enters already moving in the exit's direction.

## Cuts and camera

- **Vector law:** across a cut keep axis, direction and speed; cut at peak velocity, mid-motion. One dominant direction per
  film; the other directions are reserved for meaning (back = undo, up = success).
- **Phrase cutting:** cut on 2-, 4- or 8-beat phrases, not every beat. Average shot length shrinks toward the drop, then holds
  (establish → develop → climax → resolve). Round cumulative beat times to frames, not each step, or the grid drifts.
- **Eye trace:** the next shot's focal point sits where the eye already is, or jumps on purpose on a bar hit.
- **J/L-cuts:** the next scene's sound may start 4–12 frames early (J); a tail may run 12–24 frames late (L).
- **Camera:** push-in 1.0 → 1.12 over ~1.6 s, in-out eased; whip ~280 ms (ease-in out, ease-out in). Zoom and scale spring in
  log space (`Motion.logTrack`); a linear scale track reads as slowing down. Framings are exact windows, not scale factors.
  Merge sequential moves into one gesture. Footage pans use in-out easing (front-loaded ease-outs make them crawl).
- One element at full brightness at a time; the accent colour sits on one element at a time.
- **Moving text that must be read:** keep it within ±15° of horizontal, below ~(glyph height × fps / 2) px/s, and never motion-
  blur it. Blur belongs on surfaces and travel, not on words being read.
- **Device ledger:** list each reveal/transition as you use it; no device repeats unchanged.
- Large maps or captures: render one plate at the largest zoom you need, then move it with a transform per frame; re-rasterising
  per frame shimmers.

## Type

- Floors at 1080 short side: 22 px absolute minimum (tool: `render.cjs text`), supporting text ≥ 44 px, headlines ≥ 84 px.
- Key text sits ≥ 80 px from the sides and ≥ 100 px from top and bottom, and inside the platform safe box (below).
- Counters: tabular figures, integer snapping, locale grouping (1,250,000 / 1 250 000), finished before the next word lands.
- Crossfading two overlaid words dims the letters they share: hold shared letters solid or swap on a cut.
- Judge type size from full-resolution stills; contact sheets make everything look smaller.

## Colour

- Mix colours in OKLab (`Motion.mixOklab`); sRGB lerps dip through grey (blue → yellow = rgb(128,128,128)).
- Encode BT.709, limited range, tagged (`render.cjs` does it; `qa.sh` checks). Untagged files are guessed as BT.601 and brand
  hex values drift.
- Large gradients: 3–5 % grain stops banding after compression. Never fade black into the accent colour.

## Captions (sound-off feeds)

- Cards break on a pause ≥ 0.5 s, at 6 words or 2.5 s; at most 2 balanced lines of ~32–42 characters; ≥ 0.7 s on screen;
  ≤ 17 characters/s. Tool: `captions.py`.
- In 0.08 s before the first word; out 0.6 s after the last word or 0.05 s before the next card. The spoken word lights on its
  own start frame, never before, and pops ≤ 1.1×.
- Heavy weight, white fill with a dark outline (no pill), inside the safe box above the bottom UI. The active-word colour must
  read at 4.5:1 against its outline (the engine lifts the brand accent in OKLab until it does).
- Captions carry the words; graphics carry the evidence. Cut the third restatement of anything.
- Deliver the captioned cut, a clean master (`CAPTIONS=0`) and the `.srt`.

## Voice-over

- Record (or scratch-TTS) the VO first; the VO sets the length. Scene times come from its words.
- Word timings (`words.py`) drive cues: a reveal lands on its word's start (within 2 frames; 200 ms late reads as lag).
  `hold = VO line + pad`. Next beat starts ~0.3 s after the previous line ends.
- ≤ 3.5 words/s. Put the payoff hit in the pause before the line that names it, not under speech.
- Carve, don't duck: cut the bed's speech band under the voice and keep its body between lines (`master.py --vo`).
- A supplied SRT times cues only to ±0.2 s per word: put visual changes on the first or last word of a cue.

## Sound

- SFX may lead the picture by 2–3 frames (early reads as synced, late as broken); never trail by more than one. Tool: `qa.py sync`.
- Align SFX to their audible onset (cut each file from its first transient), and check levels with a ~100 ms envelope in the
  delivered file, not a window peak.
- A riser ends exactly on its hit. One big impact per film. Continuous motion stays silent; not every cut gets a whoosh.
  Tonal SFX share the score's key; pan can follow on-screen x.
- The loudest 100 ms sits in the payoff, after ≥ 0.4 s of near-silence. A quiet sub under the thesis and under the CTA.
- A mix of mostly short hits can't reach −14 LUFS without crushing: add sustained sound instead of forcing gain.

## Ads and UA creative

- **Hook gate (G4):** build three materially different openings as `variants` (not three palettes of one), render each first
  2 s, and judge them muted: can a stranger say what this is and why to keep watching by second 3–4? Can the film be told in
  one sentence with the sound off? The hook speaks in the viewer's outcome language; the promise lands by beat 2.
- **Frame 0 is the thumbnail** on muted autoplay: open on a picture, never black. Tool: `qa.py motion`. The poster must read at
  200 px wide. For loops, rotate so the first frame is the finished picture.
- **Open loops:** list each question the film plants and where it closes; close them all before the CTA.
- **Safe box:** the engines default to portrait top 12 %, bottom 18 %, left 8 %, right 12 % (the action rail). Vetted repos used
  stricter zones (top 13–19 %, bottom 22–26 %). The platform's current spec decides; override with `TL.safe`.
- Never invent a price, a date, scarcity ("3 spots left"), a rating or a testimonial. Social-proof overlays only with real data.
- Always ship an audio track (silent AAC if there's no sound): some platforms reject video-only files.

## Determinism and rendering

- Everything derives from t. `qa.py static` greps the engine for `Math.random`, clocks, timers, rAF and CSS animation;
  `render.cjs det` proves frames don't depend on render order.
- Audio-reactive motion reads a precomputed feature track, never a live `AnalyserNode`.
- A canvas you read pixels back from: create it with `{ willReadFrequently: true }`, or Chrome switches raster mode mid-render
  and frames differ.
- Load fonts before the first `draw`, or frame 0 renders in a fallback face.
