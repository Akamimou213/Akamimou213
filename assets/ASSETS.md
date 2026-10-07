# walaw.io — asset inventory (captured 2026-10-07)

Captured with Playwright (Chromium 141) from https://www.walaw.io/ (EN default, FR via the site's own FR toggle).
Product UI below is the site's real rendered UI. Nothing is redrawn. Animated sequences are the site's own
animations, recorded frame by frame at 30 fps using Playwright's fake clock.

## Brand
| Token | Value | Source |
|---|---|---|
| Logo (dark wordmark, for light backgrounds) | `brand/logo-light-CNbYTKYZ.svg` (845×195) | `<img>` in header |
| Logo (white wordmark, for dark backgrounds) | `brand/logo-dark-C60WY4uZ.svg` (845×195) | footer / dark sections |
| Background | `#FFFCF8` | CSS `--background` |
| Ink / primary | `#191C17` | CSS `--ink`, `--primary` |
| Muted text | `#61645F` | CSS `--muted-foreground` |
| Border | `#E3E5E2` | CSS `--border` |
| Secondary surface | `#F4F6F2` | CSS `--secondary` |
| Brand orange | `#FF9044` | CSS `--brand-orange` |
| Brand blue | `#3757DF` | CSS `--brand-blue` |
| Brand gradient | `linear-gradient(90deg, #FF962E 0%, #C75082 50%, #2B50D8 100%)` | computed `background-image` |
| Alt gradient (135°) | `#FF962E → #8B3FB8 → #2B50D8` | computed `background-image` |
| Card | radius 32px, 1px ink border, bg `#FFFCF8`, no shadow | computed style |
| Primary button | pill, ink bg, white Inter 500 16px, padding 10/24 | computed style |
| Typeface | **Inter** (Google Fonts v20, weights 400/500/600/700) | `fonts/Inter-normal-latin.woff2`, `fonts/Inter-italic-latin.woff2` |
| H1 | Inter 600, 60px, line-height 66px, letter-spacing −1.5px | computed style |

## Copy (verbatim from the site)
- EN H1: "Never miss another patient request." (rotates request / inquiry). FR H1: "Ne manquez plus jamais un appel."
- EN title: "Walaw - Voice AI built with health clinics". Meta: "Walaw answers every patient call - after hours, during overflow, in any language. Live in two weeks."
- CTA: "Schedule a demo" / "Planifier une démo" (→ `/demo`)
- Results ("What clinics see after going live." / "Notre ROI"):
  **100%** of calls answered. Day or night. No exceptions. · **2×** the output, same team · **15%** more revenue, recovered from new patients who used to hang up
- Testimonial (Rémi Vaillancourt, COO): "4x more calls answered, especially after hours, and a 10% boost in revenue."
- Features: Human Voice / Voix humaine · Appointment Scheduling / Prise de rendez-vous · Front Desk Ticketing / Gestion des suivis d'appels · Clinic Knowledge Base / Base de connaissances de votre clinique · Analytics and Visibility / Statistiques et données

## Real UI captures
| File | What it is |
|---|---|
| `seq/{en,fr}-player-ready.png` | "Walaw Agent — Ready" live demo player (DPR 3) |
| `seq/{en,fr}-player-speaking/000-089.png` | Same player after a real click on Play: "Speaking…", live waveform (30 fps) |
| `seq/{en,fr}-feat1/000-089.png` | Appointment Scheduling card: new booking arrives, then a modification (site's own animation) |
| `seq/{en,fr}-feat2/000-134.png` | Front Desk Ticketing card: tickets move New → In Progress → Completed |
| `seq/{en,fr}-feat4/000-089.png` | Analytics card: counters run 1 → 162 recovered calls, $0.1k → $11.2k revenue |
| `seq/{en,fr}-hero-wave/` | Hero waveform strip (animated) |
| `seq/{en,fr}-results.png` | Dark results card (100% / 2× / 15%) |
| `ui/{en,fr}-cta-hero.png` | Real "Schedule a demo" / "Planifier une démo" button |
| `ui/*-feat*-t*.png`, `ui/*-feat*-part*.png` | Feature cards at DPR 3 + their sub-parts (title, body, widget) |
| `screens/` | Full-page and per-section screenshots, desktop 1440 and mobile 390 |
| `work/` | Downscaled JPEG working copies used by the renderer |
| `site.json`, `site-fr.txt` | Full DOM text, links, images, CSS variables, computed colors |

## Interactions that are real (and therefore what the cursor is allowed to do)
- Clicking **Play** on the Walaw Agent player (Ready → Speaking). Real.
- **Scrolling** the Features section swaps the card and triggers its animation. Real.
- Clicking the **Schedule a demo** button. Real link to `/demo`.
- Hover on the cards produced no isolated state change, so hover is shown as pointing only.

## Not used, on purpose
- Customer / partner / investor logos (third-party trademarks; implies endorsement).
- The "#1 Rated" G2 badge and "Top 100" award: real, but out of scope for this cut.
