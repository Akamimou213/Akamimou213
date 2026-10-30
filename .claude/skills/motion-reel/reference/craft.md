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
- **Land on the beat:** the arrival (contact, settle, stamp) sits on the beat, so the move starts its travel time earlier
  (~0.05 s for a snap, the whole travel for a slide). The sound marks the landing.
- **Arrive fast, land soft:** for slams and stamps, cover 12–19 % of the remaining distance per frame at 30 fps
  (`Motion.approach`). Never overshoots; reads heavy, not springy.
- **Hit hierarchy:** light feedback on every hit (a small deform, a 1–2 % camera nudge); medium on bigger hits (only some
  elements react); heavy (time freeze, orbit) once or twice per film. Weak and short: a few elements, a few frames.
- Alternate fast and slow: a long fast stretch numbs; plan one clearly slower passage before the climax.

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
- **Camera settles slower than its subject:** shape damping ratio ~0.72, settling in ~0.35 s; camera ~1.0, ~0.6 s.
- **Never zoom into an off-centre dot:** the camera swings sideways and spikes. Render the inside world to a layer and open
  it through the dot as an iris mask. Ease an iris by area, not radius (`Motion.irisR`): a radius-eased iris closing from
  full frame changes nothing for its first frames, then jumps.
- **Carried objects:** an object that crosses a scene boundary sits at exactly the same pixels in A's last frame and B's
  first, inside the same camera transform, or it jumps.
- Continuous patterns (sunbursts, waves, tickers) rotate continuously; one notch per beat reads as stutter. Pick speeds so
  they're back in phase at the loop point.
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
- **Counters read the frame's time, not the subframe's** (engine `frameT`), or motion blur stacks several values into a
  smear. A counter that keeps running through a cutaway runs on the global clock; a frozen counter reads as a broken render.
- Readable things stay on screen for ≥ 8 clean frames. A glitch lasts 1–2 frames, only on a real cut, and always with a sound.
- Word swaps roll vertically through a mask line. A draw-on starts after its blur-in finishes.

## Colour

- Mix colours in OKLab (`Motion.mixOklab`); sRGB lerps dip through grey (blue → yellow = rgb(128,128,128)).
- Encode BT.709, limited range, tagged (`render.cjs` does it; `qa.sh` checks). Untagged files are guessed as BT.601 and brand
  hex values drift.
- Large gradients: 3–5 % grain stops banding after compression. Never fade black into the accent colour.
- **Film finish goes in post** (ffmpeg or numpy on the frames), not in the page: fresh grain per frame, halation on bright
  edges, a soft vignette, a 1 px chroma fringe with edge-clamped shifts. Grain drawn in the page makes every frame slow to
  capture and hard to compress; encode grainy masters with `-tune grain`. No grain on pixel art or flat vector styles.
- Print misregistration (colour copies offset 2–4 px) only on impact frames.

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
- TTS: spell numbers out in the TTS text and write digits in the captions. Transcribe every generated line back
  (`words.py`) and regenerate on a mismatch. Compress the voice before balancing; it sits ~10 dB over the music by RMS.
- A supplied SRT times cues only to ±0.2 s per word: put visual changes on the first or last word of a cue.

## Sound

- SFX may lead the picture by 2–3 frames (early reads as synced, late as broken); never trail by more than one. Tool: `qa.py sync`.
- Align SFX to their audible onset (cut each file from its first transient), and check levels with a ~100 ms envelope in the
  delivered file, not a window peak.
- A riser ends exactly on its hit. One big impact per film. Continuous motion stays silent; not every cut gets a whoosh.
  Tonal SFX share the score's key; pan can follow on-screen x.
- The loudest 100 ms sits in the payoff, after ≥ 0.4 s of near-silence. A quiet sub under the thesis and under the CTA.
- A mix of mostly short hits can't reach −14 LUFS without crushing: add sustained sound instead of forcing gain.
- Synthesized scores turn bass-heavy: keep 20–120 Hz around −3 dB relative to the rest, and give the bass 2nd and 3rd
  harmonics so it speaks on phone speakers.
- Measure loudness and true peak on the delivered AAC file, not the WAV: the AAC encoder can add several dB of peak (one
  report: +5 dB at 192k). Master to −2 dBTP if the encode pushes past −1.
- The default score every model writes is house at 120–128 BPM in A minor with a kick on every beat; two films scored that
  way sound alike. Pick genre, groove and key for the brief on purpose, and say why in the brief.
- A supplied track that's longer than the film: back-time it so its own ending lands on the end card, as one continuous piece.

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
- A helper that changes `globalAlpha`, `filter` or the transform restores the caller's (`save`/`restore`), or fading cards pop.
- A flood circle used as a background becomes a full-frame rect once it covers the frame; a moved circle leaves corners bare.
- Stepped styles (pixel art, cel, stop motion) pose on twos (8–12 fps) and snap to the pixel grid, but the camera and light
  move every frame: a stepped camera reads as lag. Pixel art draws at its logical resolution and scales by an integer with
  smoothing off, from a fixed palette.
- DOM engines (HyperFrames, HTML): never put `will-change` on a layer the camera scales, or its text renders blurry.
- Headless WebGL (three.js) without a GPU: launch Chromium with `--use-angle=swiftshader`. Slow, but it renders.

## Cursor

- Aim at where the target will be when the cursor lands, not where it is now. Keep it under ~4.5 % of the frame width per
  frame (65 px/frame at 1440 px, 60 fps).
- Drags are direct manipulation: while held, the value follows the cursor and the tip stays locked to the handle. On release,
  spring from the cursor's position and speed (`Motion.release`), never restart from rest.
- Typing derives from t: characters shown = floor(progress × length), on an uneven, seeded keystroke rhythm. The caret blinks
  only while idle.
- Loops: the seam matches cursor position **and velocity**, camera and content. Render frames [0, dur): a frame at t = dur
  duplicates frame 0 and stutters.

