# Get Regular film, 30 s (restart)

A from-scratch rebuild of the 51 s Maya film (`share_9_1.mp4`). It tells the story with the grammar of the illustrated reference
(`Video-96789_1.mp4`) in Get Regular's own look: near-black with moss glows, cream paper, clay accents and Inter Tight, with Maya
and the doctor redrawn in code from the first film. Made with `.claude/skills/motion-reel`: one canvas, a pure `draw(t)`,
headless Chromium and ffmpeg.

Story, 13 shots and about 2.3 s per shot: Maya, something's off → the calendar of bad days → at the doctor, the questions fly →
since when, how often, after what → her mind goes blank → "could be stress" → log it when it happens (the real app) →
meals, sleep, stress, cycle → a summary, not a story → back at the doctor, answered → logs become a report → Maya, calm → end card.

| File | What |
|---|---|
| `timeline.json` | every cut, caption, event, palette and copy string, with sources (edit here first) |
| `index.html` | the engine: seeded paper textures, the brand grounds, Maya and the doctor (rigs with moods, blinks, breath), the gut line, 12 shot kinds |
| `sound/vocut.py` | cuts the 26 s VO out of the first film's soundtrack (the lines kept are listed in it) |
| `docs/` | brief, style guide (reference grammar → ours), shot list, review log |
| `assets/` | Inter Tight and DM Sans (OFL, the site's faces), `app/` real logo SVG + app home screen, `capture/` site capture |

## Rebuild
```bash
S=.claude/skills/motion-reel; P=films/get-regular-film
ffmpeg -i share_9_1.mp4 -vn -ac 2 -ar 48000 -c:a pcm_s24le orig48.wav          # the first film's audio
python3 -I $P/sound/vocut.py orig48.wav vocut.wav && ffmpeg -i vocut.wav -af atempo=1.06 -c:a pcm_s24le $P/audio/vo-en.wav
python3 -I $S/scripts/music.py $P/timeline.json $P/out/music.wav --key D        # D major, the old bed's key
python3 -I $S/scripts/cues.py $P/timeline.json $P/out/cues.json en && node $S/scripts/sfx.mjs $P/out/cues.json $P/out/sfx.wav
python3 -I $S/scripts/master.py $P/out/audio.wav $P/out/music.wav:0.8 $P/out/sfx.wav:.6 --vo $P/audio/vo-en.wav:1 --duration 30 --lufs -14
SEGS=4 bash $S/scripts/render-all.sh $P get-regular en $P/out/audio.wav V=1080x1920 P=1080x1350
bash $S/scripts/qa.sh $P/out/get-regular-en-V.mp4 $P/timeline.json
```

## Real vs written by us
- **VO: real.** The narrator's own takes from the first film, re-cut from 51 s to 26 s and sped up 6 %. Lines dropped:
  "Meet Maya. Level one: gut guesser.", "low energy", "So it ends with", "Time to level up.", the step numbers,
  "Give it a few weeks so a pattern can repeat.", "From guessing to knowing."
- **On-screen lines:** the VO lines, verbatim.
- **End card: real.** The Get Regular logo (site SVG); "Gut feelings. Confirmed." and "Download on the App Store" are verbatim
  from getregular.com (captured 2026-10-29); "Educational only. Not medical advice." comes from the first film's end card.
- **App screen: real.** The home screen the site publishes (`/images/home.png`). The thumb taps "Yes" on "Did you go?", which
  is a real control; nothing on the screen is redrawn.
- **Characters:** Maya and the doctor follow the first film's designs, redrawn in code.
- **Illustrations: ours.** The gut line, calendar, clipboard, triptych, circles, scroll and report illustrate the story. The report is
  generic: it is not the app's real report screen.
- **Claim to check:** "Get Regular turns your daily logs into a report you can bring to your doctor" comes from the first film.
  The site mentions "AI-assisted summaries", "Weekly digest reports" and "Ask better questions", but doesn't name a doctor report
  in those words. Confirm the feature exists before paid spend.
- **Music and SFX:** original, synthesized in numpy.

## What was tested
- Text check (`render.cjs text`) in 9:16 and 4:5. Accepted flags: "stress?" while the clipboard slides off, and in 4:5 the
  decorative "?" marks near the top edge.
- Determinism at three frames; static lint clean.
- Loudness −14.2 LUFS integrated, −1.7 dBFS peak; audio sync median 31 ms.
- QA "jumps" are the intended hard cuts.
- Not tested: a listen by a human. Check the VO joins at 2.4 s, 4.3 s, 10.4 s and 12.7 s (the old music bed under the voice
  is cut there too, masked by the new score) and the score's level under the voice.
