# Walaw — 20s promo (draft, awaiting sign-off before full render)

- `timeline.json` — the single source of timing (120 BPM, beats, event times) and all on-screen copy (EN/FR)
- `index.html` — renderer; `?fmt=V|S|L` (9:16, 1:1, 16:9) and `?lang=en|fr`
- `render.cjs` — `node render.cjs stills <fmt> <lang> <dir> <t...>` or `node render.cjs range <fmt> <lang> <from> <to> <out.mp4>`
- `music.py` — original track + UI sound design, synthesized from `timeline.json` events
- `out/contact/` — contact sheets (one frame per beat), `out/music-preview.m4a`
- `capture/` — Playwright scripts that captured the real site into `../assets` (see `../assets/ASSETS.md`)

Every product pixel comes from captures of walaw.io; the cursor and type are the only things drawn.
