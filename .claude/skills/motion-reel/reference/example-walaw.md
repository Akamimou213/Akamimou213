# Worked example: Walaw (one client, three films)

Walaw (walaw.io) is a Québec startup that sells voice-AI agents to health clinics. It's here to show the method end to end;
nothing in the skill depends on it. Source lives in `walaw-promo/` on the `claude/eager-ritchie-kkalq9` branch (media is git-ignored).

## The brief, as given
A 20 s promo with "showreel energy", real assets only (Playwright screenshots, real logo/colours/fonts saved to
`./assets` and listed before animating), no redrawn UI, a 5-beat story (hook in 5 words → UI assembles → 3 features
with a cursor doing real actions → one proof number → logo + CTA), original 120 BPM music with clicks/whooshes on the
beat, 9:16 first, then 1:1 and 16:9, and a contact sheet of one frame per beat before the full render.

## How each gate played out
| Gate | What happened | Where |
|---|---|---|
| Assets | crawled the site: copy (EN + FR via the site's own toggle), CSS tokens (ink #191C17, bg #FFFCF8, accent orange), Inter woff2, logos, customer logos featured on the site, UI cards; recorded the hero waveform `<canvas>` at 30/60 fps with the fake clock on a transparent background | `assets/ASSETS.md`, `walaw-promo/capture/` |
| Film 1: promo | scenes on a 120 BPM grid, three formats from one timeline, EN/FR | `walaw-promo/` |
| Reference | a launch video's grammar (hook → does → books → grid → stamp → manifesto → lockup, two hard cuts) was rebuilt with Walaw's real UI | `walaw-promo/a/` |
| Film 2: variant A | 16:9 at 60 fps; the real waveform became the recurring character; italic accent words; adaptive subframes | `walaw-promo/a/` |
| Film 3: morph | French only (Québec audience): one shape morphs logo → button → field → answer → loader → pin → Québec map → case studies → tabs → board → search → logo; seamless loop | `walaw-promo/morph/` |
| Sound | numpy score; `cues.py` from timeline events → `sfx.mjs`; limiter master to −14 LUFS | `walaw-promo/morph/music.py`, `cues.py` |
| QA | contact sheets per beat, loop seam SSIM 0.997, corners clean, decode clean | `walaw-promo/morph/out/` |

## Decisions that generalise
- **Market language:** the Québec audience got French copy taken from the site's own French version (Charter of the
  French language for commercial ads). Your film should do the same for its own market's rules.
- **Map without invented data:** per-clinic locations couldn't be verified within the time-box, so the map shows the
  province filling in, with a caption taken from the site, instead of fake pins.
- **Customer logos:** used only because the site features those clinics as case studies; flagged as needing client sign-off.
- **The user's notes:** "where is the video" (deliver drafts), "too much time on clinic locations" (time-box), "enough for
  the four renders" (stop). These became house rules in `lessons.md`.
