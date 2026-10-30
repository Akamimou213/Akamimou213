# 4 — Production: what we make, with which tool

No shoot is needed: the film is drawn in code from TOMSO's own visual language. Everything renders here except the voice.

| Need | Tool | Where | Notes |
|---|---|---|---|
| Animation (all scenes, 3 formats, hook variants) | `/motion-reel` scenes engine: one canvas, pure `draw(t)`, Playwright + ffmpeg | this repo, `films/tomso-ad/` | Calendar grid, line with ring nodes, pictograms all drawn in code; `render.cjs text` checks every string per format |
| Fonts | Faculty Glyphic, Geist, Geist Mono (OFL, Google Fonts) | `assets/fonts/` | Full families from Google's repo; the site serves subsets |
| Logo | TOMSO SVG from the client | `assets/brand/` | Until it arrives: the site's PNG for drafts only |
| Music | `music.py` (original synthesis, 120 BPM) | here | The ElevenLabs connector in this session is the restricted one: no music generation |
| SFX | `cues.py` → `sfx.mjs` (synthesized from timeline events) | here | Paper ticks, pen hiss, clear, chord; all placed from the same timeline |
| Voice-over (version V) | **ElevenLabs** (`creative_generate_speech`) | connector | Pick a natural Québec-French voice from the account's voices; if none fits, design one from a description you or TOMSO approve. Generation spends credits: two takes, one approval |
| Word timings + captions (V) | `words.py` (local Whisper) → `captions.py` | here | Captions burned in, plus a clean master and `.srt` |
| Mix + master | `master.py` (−14 LUFS, voice carve), re-measured on the AAC | here | |
| QA | `qa.sh` (safe box, text, sync, loudness, loop, determinism) | here | |

## Order of work
1. Shot list on the beat grid (`docs/shotlist.md`) and one still per beat in 9:16 → contact sheet → critique, before any
   animation polish.
2. Draft render (9:16, hook A, text only) for pacing; send it.
3. Music + SFX; then the VO take for V (needs your go on ElevenLabs credits and the voice).
4. All formats, hooks A/B/C × T/V, FR then EN; QA; delivery with poster frames.
