# Portfolio reel — Mohamed Barkat

26 s motion film for the portfolio site, made with `.claude/skills/motion-reel` (one canvas, pure `draw(t)`, headless
Chromium → ffmpeg). Grammar from a reference developer intro (`refs/`, not committed); content entirely from the site.

| File | What |
|---|---|
| `timeline.json` | every time, copy string, colour, SFX event and the score's arrangement (edit here first) |
| `index.html` | the engine: five acts, one cobalt dot as the recurring character |
| `docs/` | brief, style guide (reference grammar → ours), shot list |
| `assets/` | fonts (OFL) + portrait; `ASSETS.md` lists sources and what's ours |

## Rebuild
```bash
S=.claude/skills/motion-reel; P=films/portfolio-reel
python3 -I $S/scripts/music.py $P/timeline.json $P/out/music.wav
python3 -I $S/scripts/cues.py $P/timeline.json $P/out/cues.json en && node $S/scripts/sfx.mjs $P/out/cues.json $P/out/sfx.wav
python3 -I $S/scripts/master.py $P/out/audio.wav $P/out/music.wav:1 $P/out/sfx.wav:.8 --duration 26 --ceiling -2.6
SEGS=4 bash $S/scripts/render-all.sh $P portfolio-reel en $P/out/audio.wav L=1920x1080 V=1080x1920
bash $S/scripts/qa.sh $P/out/portfolio-reel-en-L.mp4 $P/timeline.json
```

## Real vs written by us
- **Story:** who he is (name, position, segments) → "Six levers. One owner." → the six levers one by one → book a call.
  No results, industries or client numbers by design: the film introduces him and what he does.
- **Real, verbatim from the site:** name, "Senior performance marketer", "D2C · Apps · Local · B2B", "The system",
  "Six levers. One owner.", the lever names (Plan, Track, Create, Launch, Analyze, Get found) and every label in the lever
  visuals (CAC ceiling / Channel mix / Budget split / Test order; view_item / add_to_cart / purchase; GTM · CAPI · server-side;
  Hook A/B/C, Pain / Proof / Offer, Live; Meta / Google / TikTok; Rebalancing on cost per conversion; Platform-reported /
  Measured in backend / CRM; The gap is where the decision is.; yourbrand.com / competitor.com / directory.com), URL, CTAs,
  portrait, colours and fonts.
- **Written by us:** the greetings (Hello · مرحبا · Bonjour · Xin chào) and "SEARCH · MAPS · AI ANSWERS" (condensed from
  "Rank in search, maps and AI answers.").
- **Illustrative:** bar heights, checkmarks and the rank swap are motion explaining each lever, the same way the site's
  "Illustration" panels do. They are not client data.
- **Music and SFX:** original, synthesized in numpy; no samples.
