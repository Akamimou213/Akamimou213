# Director's brief — Portfolio reel (Mohamed Barkat)

**Logline (v2).** One cobalt dot introduces a performance marketer: it greets, becomes his face, states his position,
then walks through the six levers he owns (plan, track, create, launch, analyze, get found) and hands you the call to book.
The viewer should feel: one person who owns the whole acquisition system, and is easy to hire.

- **Subject + source:** Mohamed Barkat, senior performance marketer. All copy and numbers from his site
  (https://mohamedbarkat.vercel.app/ = `index.html` in this repo, identical text on 2026-10-10). Portrait from `public/`.
- **Goal + audience:** embedded on the portfolio site (hero or About) for founders and marketing leads; secondary 9:16 cut for
  LinkedIn/Instagram. Success = visitors who watch book a call; it is not an ad test.
- **Reference:** `refs/ref.mp4` (a developer intro, 15 s, 16:9, 60 fps, 120 BPM). Take the grammar, never the content.
- **Audio:** original score synthesized at 120 BPM (`music.py`) + SFX from timeline events. No voice-over, no captions
  (type carries everything; website autoplay is muted anyway).

## Look
- Palette (from `src/styles.css`): ink `#0c0d10`, on-dark `#eceef2`, muted-dark `#a0a3a8`, paper `#f2f3ef`, paper-3
  `#d3d6ce`, muted `#585b60`, signal cobalt `#2b44ff`, signal-on-dark `#8c99ff`.
- Type: Archivo (display/body, the site's font), Instrument Serif italic for accent words (the site's `<em>`), IBM Plex Mono
  uppercase for eyebrows (the site's `.mono`), IBM Plex Sans Arabic for the Arabic greeting.
- The recurring character: a cobalt dot (the site's signal colour), never a mascot.
- Banned: corner labels, HUDs, frames, centred title on gradient, fades as the default entrance.

## Deliverables
`out/portfolio-reel-en-L.mp4` (1920×1080, website), `out/portfolio-reel-en-V.mp4` (1080×1920, social), poster, contact sheets.
