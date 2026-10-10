# Portfolio reel — Mohamed Barkat

18 s motion film for the portfolio site, made with `.claude/skills/motion-reel` (one canvas, pure `draw(t)`, headless
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
python3 -I $S/scripts/master.py $P/out/audio.wav $P/out/music.wav:1 $P/out/sfx.wav:.8 --duration 18 --ceiling -2.6
SEGS=4 bash $S/scripts/render-all.sh $P portfolio-reel en $P/out/audio.wav L=1920x1080 V=1080x1920
bash $S/scripts/qa.sh $P/out/portfolio-reel-en-L.mp4 $P/timeline.json
```

## Real vs written by us
- **Real, verbatim from the site:** name, titles (Senior performance marketer; Creative strategist), channel names, service
  names, "results." section intro, the 11 industries, the Super app proof (116,464 first deliveries in 2025 at $1.81 each;
  ride-hailing & delivery; Algeria, Morocco, Tunisia, Senegal; full year 2025), URL, CTA labels, portrait, brand colours and fonts.
- **Written by us:** the greetings (Hello · مرحبا · Bonjour · Xin chào: his three languages + where he's based) and the line
  "PAID GROWTH YOU CAN — plan. scale. *trace.*" (built from the hero "Paid growth you can trace" and the Plan/Scale copy).
- **Illustrative:** the dot field and the dot band that fills while the number counts. They are motion, not a chart.
- **Music and SFX:** original, synthesized in numpy; no samples.
