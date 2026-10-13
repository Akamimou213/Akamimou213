# Appfound explainer film

64 s motion film for Appfound (https://appfound.vercel.app/), made with `.claude/skills/motion-reel` (one canvas, a pure
`draw(t)`, headless Chromium, ffmpeg). It's one continuous shot. Users are dots running along the funnel the site's hero
shows (Ad > Store > Onboarding > Paywall > Paying):
- They leak at Store, Onboarding and Paywall, and four founder quotes say why.
- One user pays and opens Appfound's blue.
- The six services land on the stage each one fixes, in three phases.
- "Scale only what pays."
- The first 90 days, step by step, then the operator.
- "INSTALLS DON'T PAY. SUBSCRIBERS DO." over the same funnel, now paying, and the free Growth Plan.

No results by design.

| File | What |
|---|---|
| `timeline.json` | every time, string, colour, flow rate and leak odd, plus the reduced-motion variant (edit here first) |
| `index.html` | the engine: four acts on three grounds; a row funnel in 16:9 and 1:1, a vertical stack in 9:16 |
| `sound/place.py` | places real CC0 recordings on the picture's timing (106 cues, 66 recordings); `sound/fetch.sh` downloads them |
| `docs/` | brief, directions (decision page), style guide (what we took from the references), scene specs |
| `DECISIONS.md` · `SOURCES.md` · `CREDITS.md` · `LISTEN.md` | one-line decisions; the source of every on-screen line; sound credits; five timecodes to check by ear |
| `captions.srt` | every on-screen line, timed |
| `assets/` | fonts (OFL, from the site), portrait, `capture/` (site capture: copy, tokens, logo) |

## Rebuild
```bash
S=.claude/skills/motion-reel; P=films/appfound-film
bash $P/sound/fetch.sh                                                       # CC0 recordings into audio/raw/ (git-ignored)
python3 -I $P/sound/place.py $P/timeline.json $P/audio/raw $P/out/sfx.wav $P/out/cues.json
python3 -I $S/scripts/music.py $P/timeline.json $P/out/music.wav --key D
python3 -I $S/scripts/master.py $P/out/audio.wav $P/out/music.wav:1 $P/out/sfx.wav:.9 --duration 64 --lufs -14 --ceiling -2.0
SEGS=2 bash $S/scripts/render-all.sh $P appfound en $P/out/audio.wav L=1920x1080 V=1080x1920 S=1080x1080
VARIANT=reduced bash $S/scripts/render-all.sh $P appfound en $P/out/audio.wav L=1920x1080   # reduced-motion cut
bash $S/scripts/qa.sh $P/out/appfound-en-L.mp4 $P/timeline.json
```
Delivered names: `out/appfound-en-L.mp4` (16:9 master), `-V` (9:16), `-S` (1:1), `-reduced-L` (reduced motion).

## What was tested (2026-10-12)
- Text check (`render.cjs text`) in all three formats: no clipped, unsafe, too-small or low-contrast text at settled times.
  The flags it still raises are mid-transition samples (lines rolling, iris closing, cards scaling in).
- Determinism: frames 3.4 s, 31.2 s and 58.6 s render identically twice.
- Motion QA on every format: frame 0 is a picture; no flashes, jumps or dead stretches.
- Loudness on every format: −14.0 LUFS integrated, −1.7 dBTP true peak.
- Sync: median 24 ms between each cue and its picture event. The outliers are whooshes that swell into a cut and the
  reverse that sucks into each hero hit (by design).
- Design review by a separate agent, using the explainer prompt's review questions. Fixes applied: vertical funnel in 9:16,
  bigger dots and labels, colour meaning, phase timing, 90-day legibility, the funnel back in the payoff, a bigger end card.
- Not tested: a listen by a human (see `LISTEN.md`); reading the 16:9 cut at phone width (the 9:16 cut is for phones).

## Next
- An ear check on the five timecodes in `LISTEN.md`.
- A voice-over version: the timeline already holds every line, so a VO would set the cue times.
- Hook variants for paid tests (for example opening on a founder quote instead of "INSTALLS DON'T PAY."), judged on cost per lead, not CTR.
