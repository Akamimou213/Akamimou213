---
name: motion-reel
description: Make any motion-graphics video rendered entirely from code (one canvas + headless Chrome + ffmpeg) with an original or supplied soundtrack — product/SaaS launch, mobile-app ad or UA creative (with hook variants), brand film, explainer, data story, event promo, personal showreel or intro, social cutdowns in 9:16/1:1/4:5/16:9. Use when the user asks for a video, reel, motion ad, animated explainer, morph film, "make a video for <URL or app>", hook/CTA variants for creative testing, or wants a reference video's style rebuilt for their own subject.
---

# Motion reel

The one-liner gets a clip; the harness gets a studio. This skill is the harness: a director's brief, real assets,
a pure `draw(t)` engine on a beat grid, a critique loop on rendered frames, and a render/sound/QA pipeline that
exports every format, language and variant from one timeline. It works for any subject. The worked example
(`reference/example-walaw.md`) is one client; nothing in the method depends on it.

## 0. Operating mode

- **Keep momentum.** Show each gate's artifact (asset list, storyboard, contact sheet), then keep working.
  Stop and wait only when the brief or the user says so. "Where is the video?" means you waited too long: send a draft.
- **Time-box research to ~10 minutes per question.** If some data (locations, customer lists, numbers) can't be
  verified quickly, design around it, say so, and move on. Never invent it.
- **Real vs dramatized:** every delivery says which copy, data, UI and claims are real (with sources) and which lines we wrote.
- **One timeline file is the single source of truth:** times, copy per language, events, variants. Each note becomes a one-line edit.
- **Stop when told.** "That's enough" means ship what exists.

## 1. Pick the film type (decides assets, engine and structure)

| Subject | Real assets come from | Starter | Typical spine (on the beat grid) |
|---|---|---|---|
| Website / SaaS product | `scripts/capture.cjs` (screenshots, copy, tokens, fonts, logos, the site's own animations) | scenes or morph | hook → product assembles → 3 features as cursor moments → proof → logo + CTA |
| Mobile app | screen recordings: iOS Simulator `xcrun simctl io booted recordVideo out.mp4`, Android `adb shell screenrecord /sdcard/out.mp4`, or the client's own recordings; store screenshots of **their** app | scenes | hook (problem/outcome) → app in hand → 2–3 feature taps → proof (rating, metric with source) → end card |
| Paid social / UA creative | any of the above + `variants` in the timeline | scenes | hook in the first 1–2 s, readable with sound off, one idea, end card; render hook/CTA variants from one timeline |
| Brand with no product UI | logo files, brand book, fonts, palette, supplied photography | scenes (kinetic type) or morph | manifesto in kinetic type, accent element travelling between states, lockup |
| Personal showreel / intro | the person's own work and name | scenes or morph | "what I do" in ≤5 words → range of techniques → signature move → name |
| Explainer / data story | sourced datasets (official stats, the client's dashboards), public-domain maps (Natural Earth) | scenes | question → mechanism in 3 steps → the number with its source on screen → takeaway |
| Event / launch promo | the organiser's assets, date, venue, verbatim | scenes | date hook → what happens → who → where/when → CTA |
| Narrated launch / explainer (VO-led) | the client's VO or a scratch TTS, plus any source above | scenes + captions | VO first: scene times come from its words (`words.py`); captions burned in |
| Talking head / UGC with B-roll | the creator's footage + SRT | out of scope here: use a companion (`reference/repos.md`) or render overlays with a transparent background | no cutaway in the hook's first second, ≥ 2 s of face between cutaways |

Morph (`templates/engine-morph.html`) = one shape that never cuts and changes size, radius and ink while content swaps
inside it; seamless loops. Scenes (`templates/engine-scenes.html`) = kinetic type, real captures as cards, a counted proof
number and an end card, joined by hard cuts or iris transitions. Both share the same contract, so you can mix them.

## 2. Inputs (ask only if missing and material; otherwise use the default and say so)

| Input | Default |
|---|---|
| Subject + source | URL, app, brand files, or the person's work; required |
| Goal + audience | what the viewer should do or feel; for ads, the KPI the test will be judged on |
| Duration | 15–20 s (ads: 6–15 s; showreels: 30–60 s) |
| Formats | 9:16 first, then 1:1, 4:5, 16:9, all from one timeline |
| Language(s) | the audience's language(s). Check local language law for commercial ads (e.g. Québec requires French) and confirm with the client |
| Claims | verbatim from the source, with a source note. Performance claims need substantiation under local advertising law (e.g. Canada's Competition Act, the US FTC); flag them, don't decide them |
| Reference | a video to take the *grammar* from (pacing, transitions, type), never the content. Libraries: whatships.com |
| Music | original, synthesized at 120 BPM, or the client's track unchanged and measured |
| Voice-over | none; if supplied (or wanted), it sets the length and drives cues and captions (`reference/craft.md` § Voice-over) |
| Captions | burned in for paid social (sound off), plus a clean master and an `.srt`; skipped for brand films unless asked |
| Character / mascot | only from a supplied asset; otherwise a real brand element becomes the recurring "character" |

## 3. Pipeline with gates (don't skip gates)

| Gate | Do | Artifact |
|---|---|---|
| G0 Brief | Fill `templates/director-brief.md` (logline, refs, look, beat sheet, deliverables) | `docs/brief.md` |
| G1 Assets | Collect real assets for the film type (§1). For sites, `capture.cjs site / clip / record`. List what you found and what you won't use. | `assets/ASSETS.md` |
| G2 Reference | `scripts/refscan.sh ref.mp4 docs/ref`: cuts, 4 fps sheets, transition strips, loudness, tempo. Name the grammar. | `docs/style_guide.md` |
| G3 Music | Synthesize (`music.py`) or measure (`beats.py`). Put every cut and accent on the grid. | `timeline.json` |
| G4 Story | Shot list on the grid (`templates/shotlist.md`) with a reading hold per line; the holds must fit the duration. If the direction is open, offer 3 storyboard variants (`prompts/storyboard-variants.md`). Ads: the hook gate (§6). VO films: words → `captions.py`. | `docs/shotlist.md` |
| G5 Stills | One still per scene → contact sheet → critique (`prompts/critique-pass.md`) → fix. Then one frame per beat, and `render.cjs text` for every language × variant × format (clipped, unsafe, overlapping, too small, low contrast). Repeat until every score is 8+ and the text check is clean. | contact sheets, `docs/review_log.md` |
| G6 Draft | `SUB=1` render of one format to judge pacing; send it. | draft MP4 |
| G7 Final | All formats in parallel, per language and variant; SFX cues from timeline events + music; master to −14 LUFS (`--vo` carves the bed under a voice); mux. Captioned films also render `CAPTIONS=0`. | `out/<name>-<lang>[-<variant>][-nocap]-<fmt>.mp4`, `.srt` |
| G8 QA + ship | `scripts/qa.sh`: colour tags, audio track, decode, LUFS, contact, phone, strips, poster, loop seam, motion (frame 0, flashes, jumps, dead stretches), static determinism lint, corners, sync. Commit source; git-ignore media. | README, contact, poster |

For long films, write `templates/ANIMATION_GUIDE.md` into `docs/` first, then split chapters across subagents.

## 4. Engine rules (`lib/motion.js`, `templates/engine-*.html`)

- One canvas and one pure `draw(t)`. No `Math.random` (use the seeded `rng`/`hash`), no timers, no CSS transitions and
  no state carried between frames. `render.cjs det` proves it.
- Use closed-form springs with a hair of overshoot (`spring(t, 170, 20)` ≈ 2.3 %). When a value changes target several
  times, **sum one spring per change** (`track`). For tab indicators, put each edge on a different spring. Zoom and scale
  spring in log space (`logTrack`); colours mix in OKLab (`mixOklab`).
- Timing, holds, cuts, camera, type, colour, captions, VO and sound numbers live in `reference/craft.md`. Read it before G4.
- Content enters after its container starts morphing and leaves before the next morph (`swapAlpha`), with a short blur.
- Never fade black into the accent colour. Move an accent element between states, or iris a new background open.
- Layout is a function of the format (`?size=WxH`). Camera zoom/crop per format (`crop`, `cropV`); portrait pushes in.
  Reframe type and UI per format; don't crop blindly. Type never goes below 22 px at 1080 wide. Engines publish
  `window.SAFEBOX` (portrait default: top 12 %, bottom 18 %, left 8 %, right 12 % for the action rail; `TL.safe` overrides).
- Captions (`TL.captions[lang]`, written by `captions.py`) draw in a rail at the bottom of the safe box; scene content gets the
  space above it. `?captions=0` / `CAPTIONS=0` renders the clean master.
- Size containers for the longest language and variant string (French or German copy usually runs longer than
  English); check every language × variant in the contact sheet.
- Loops: `loopT(t, dur)`. The last frame must equal the first (SSIM ≥ 0.99).
- Motion blur averages N subframes, raised to 10–24 on fast moves (`fast`). **Never let subframes straddle a hard cut**:
  `subframeTimes` clamps them, otherwise you get a grey ghost frame.
- To blur a transition, render it to a layer and blur the layer once. `ctx.filter` on every draw call is ~100× slower.
- Batch big dot fields into a few `Path2D`s by quantized tone. For image sequences, decode lazily and evict old frames.
  Inject fonts as base64 `FontFace`, because file:// blocks font CORS.

## 5. Real assets, honestly used

- **Real UI only.** Crop and animate captures or recordings; never redraw product screens from imagination. If a style
  needs drawn UI (morph films), every word and number in it is verbatim from the product.
- The cursor or finger only performs actions the real product supports; otherwise it points.
- Record live animations frame-accurately: `page.clock.install()`, then `clock.runFor(1000/fps)` between clip screenshots.
- Third-party logos appear only where the client publicly features them; customer logos imply endorsement. Never
  invent stats, locations, testimonials, ratings or customers.
- **Placeholders can't ship:** `render.cjs video` refuses while copy has `[brackets]`, a stat has no number or an image is
  missing. Stills and sheets still work, for drafting.
- Licences: CC0 needs no credit, CC BY needs a credit line, fonts are usually OFL, and Remotion needs a company licence
  above 3 people. Store badges and device frames: use official artwork only, under the platform's marketing guidelines.

## 6. Ads and creative testing

- **Hook gate (G4):** three materially different openings as variants, judged muted on the first 2 s: does a stranger know what
  this is and why to stay by second 3–4? Frame 0 is the thumbnail on muted autoplay: open on a picture. Details: `craft.md`.

- One timeline, many variants. `variants.B` deep-merges over the timeline (copy, scenes, keys, palette).
  Render with `--variant B` or `VARIANT=B`. Change one thing per variant (the hook, the CTA, the proof) so the test
  can attribute the result.
- The hook carries the first 1–2 s and must read with the sound off. The end card holds long enough to act on.
- Keep key content out of the platform UI zones, including the right-hand action rail. The engine's safe box is a default;
  check the platform's current spec before delivery and set `TL.safe`. `render.cjs text` checks every string against it.
- Deliver per variant: captioned cut, clean master, `.srt`, poster that reads at 200 px. Always with an audio track.
- The skill makes the variants; the test picks the winner. Judge on the downstream KPI (CPA/CPI to activation,
  retention, ROAS), not on CTR or thumb-stop rate alone.

## 7. Sound

- Use original music synthesized in numpy (`music.py`: drums, FM plucks, keys, sub bass; sampled piano via SFZ when it
  fits) or the client's track unchanged. No generic synth pads. For loops, render twice and keep the second pass.
- SFX come from `cues.py` → `sfx.mjs`, driven by timeline events (clicks, typing, morphs, scene changes). Something happens on
  every beat, but not every cut gets a whoosh. SFX may lead the picture by 2–3 frames, never trail it.
- Voice-over: `words.py` (local faster-whisper, or a supplied SRT) → `captions.py`; cue reveals to word starts. Mix with
  `master.py --vo vo.wav`: the bed's speech band is carved under the voice instead of ducking the whole track.
- The loudest moment sits in the payoff, after a beat of near-silence. Supplied tracks: `beats.py` finds downbeats from harmony
  changes + kicks; confirm by ear.
- Master with `master.py`: look-ahead limiter, −14 LUFS, true peak ≤ −1 dBTP. Avoid ffmpeg `loudnorm` in dynamic mode
  on dynamic music (it crushed a piano score's LRA from 9.6 to 5.7 LU).
- Verify sync: onsets from 3 frames early to 1 frame late at every cut and click (`qa.py sync`; flags are items to review).

## 8. Banned looks

Corner labels, HUDs, timecodes, frame borders and crop marks. Also: a centered title on a gradient, everything
fading in, blurry upscaled text, dead beats with nothing happening, sliding instead of easing, and text overlapping
during swaps.

## 9. Gotchas already paid for

- `element.screenshot()` waits for "stable" and times out on animated pages → use `page.screenshot({clip})`.
- Dismiss cookie banners first. Scroll-driven sections need per-scroll-step captures.
- Probe the DOM before capturing: the "animation" may be a `<canvas>`, and the obvious selector may hit a marquee.
- Modern CSS returns `lab()`/`oklab()` colours; `capture.cjs` converts them to hex via canvas.
- In a repo with `"type": "module"`, `.js` is ESM, so Node CommonJS scripts are named `.cjs` (`lib/` carries its own package.json).
- Derive the cursor and every "hold" from t. A stateful pointer breaks parallel rendering.
- `pkill -f "<pattern>"` from a shell whose command line contains the pattern kills that shell.
- In contact sheets, sample ~0.3 s into each beat. Late samples catch content mid-exit and look empty.
- Concat lists use paths relative to the list file.
- Generate-then-trace (a video model makes base motion, code redraws on top) needs a video-generation API key and budget.
- Containers with a preinstalled browser: set `CHROMIUM_PATH` (e.g. `/opt/pw-browsers/chromium`) and don't run `playwright install`.
- Untagged H.264 is guessed as BT.601 and shifts brand colours: `render.cjs` encodes and tags BT.709 limited range.
- `master.py --vo`: a smoothed squared signal can dip below zero from float rounding; clamp before `sqrt` (NaN killed the limiter once).
- Kicks alone can't find bar 1 when beats 1 and 3 have equal kicks; chord changes can. Off-beat sub bass looks like a hat-locked
  tracker, so `beats.py` warns instead of shifting.

## 10. Files

| Path | Use |
|---|---|
| `templates/director-brief.md` · `shotlist.md` | G0 brief, G4 shot list |
| `templates/engine-scenes.html` + `timeline.scenes.json` | cut-based starter: kinetic type, capture cards with per-format crop, counted stat with source, end card, cursor passes, variants |
| `templates/engine-morph.html` + `timeline.morph.json` | one-shape starter: morphing container, camera zoom per format, layer blur, loop |
| `templates/ANIMATION_GUIDE.md` | rules for subagents writing chapters of a long film |
| `lib/motion.js` | `spring` `track` `logTrack` `indicator` `swapAlpha` `loopT` `segOf` `rng` `hash` `mixHex` `mixOklab` `subframeTimes` `stagger` `E` |
| `scripts/capture.cjs` | `site` / `clip` / `record` |
| `scripts/refscan.sh` | reference breakdown |
| `scripts/render.cjs` · `render-all.sh` | `sheet` / `stills` / `video` / `det` / `text`; all formats in parallel → concat → mux (`CAPTIONS=0`, `AUDIO_ONLY=1`) |
| `scripts/words.py` · `captions.py` | word timings (local Whisper or SRT) → caption cards in the timeline + `.srt` |
| `scripts/music.py` · `cues.py` · `sfx.mjs` · `master.py` · `beats.py` | score, cues, SFX, mix + limiter + voice carve, beat grid |
| `scripts/qa.sh` · `qa.py` · `setup.sh` | QA pass (`corners` `sync` `motion` `static`); toolchain setup |
| `prompts/` | critique pass, storyboard variants, director notes |
| `reference/craft.md` | timing, holds, cuts, camera, type, colour, captions, VO, sound and ad numbers, with sources |
| `reference/` | lessons and house rules, the worked example, vetted repos/engines and licences |

## 11. Quick start

```bash
S=.claude/skills/motion-reel; P=films/<name>                      # P = the film's project folder
bash $S/scripts/setup.sh                                           # prints PLAYWRIGHT_PATH / CHROMIUM_PATH to export
node $S/scripts/capture.cjs site https://example.com $P/assets      # web subjects; other subjects: see §1
bash $S/scripts/refscan.sh refs/ref.mp4 $P/docs/ref
cp $S/templates/engine-scenes.html $P/index.html; cp $S/templates/timeline.scenes.json $P/timeline.json   # or engine-morph
node $S/scripts/render.cjs $P sheet 1080x1920 $P/out/contact-V.png --lang en   # G5, one frame per beat
node $S/scripts/render.cjs $P det 1080x1920 3.2                               # no state between frames
node $S/scripts/render.cjs $P text 1080x1920 --lang en                        # clipped / unsafe / overlap / small / contrast
python3 -I $S/scripts/words.py audio/vo-en.wav --lang en > $P/out/words.en.json   # VO films only (or pass an .srt)
python3 -I $S/scripts/captions.py $P/timeline.json $P/out/words.en.json en --srt $P/out/<name>-en.srt
python3 -I $S/scripts/music.py $P/timeline.json $P/out/music.wav
python3 -I $S/scripts/cues.py $P/timeline.json $P/out/cues.json en && node $S/scripts/sfx.mjs $P/out/cues.json $P/out/sfx.wav
python3 -I $S/scripts/master.py $P/out/audio.wav $P/out/music.wav:1 $P/out/sfx.wav:.8 --duration 8   # + --vo vo.wav
SUB=1 bash $S/scripts/render-all.sh $P draft en $P/out/audio.wav V=1080x1920   # G6
bash $S/scripts/render-all.sh $P <name> en $P/out/audio.wav                     # G7: every format
VARIANT=B bash $S/scripts/render-all.sh $P <name> en $P/out/audio.wav           # hook test B
CAPTIONS=0 bash $S/scripts/render-all.sh $P <name> en $P/out/audio.wav          # clean master next to the captioned cut
bash $S/scripts/qa.sh $P/out/<name>-en-V.mp4 $P/timeline.json                   # G8
```
`render.cjs` prints ms/frame. Plan one segment per CPU core. To use the skill elsewhere, copy this folder into that
repo's `.claude/skills/` or into `~/.claude/skills/`.

## 12. Deliverables

`out/<name>-<lang>[-<variant>][-nocap]-<fmt>.mp4` (H.264 yuv420p BT.709, AAC, faststart), `.srt` per language when
captioned, `contact.png`, `poster.png`,
`loop_check.mp4` when looping, `README.md` with sources and credits, and clean source committed (media git-ignored).
For files over the share limit, make a two-pass ~3.5 Mbps share copy and keep the master. Close with what's real vs
written by us, and what you'd improve next.
