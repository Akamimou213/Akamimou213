# Assets — Get Regular film

| Asset | Source | Used |
|---|---|---|
| `app/logo-white.svg` | getregular.com `/logo-white.svg` (captured 2026-10-29) | end card |
| `app/home.png` | getregular.com `/images/home.png`, the app home screen in a device frame | shot 6 (log it) |
| `fonts/EBGaramond-*.ttf` | Google Fonts, SIL OFL 1.1 (`fonts/OFL.txt`) | every line and the tagline |
| `fonts/DMSans.woff2` | the site's own DM Sans (SIL OFL 1.1) | CTA and the disclaimer |
| `capture/` | `capture.cjs site https://www.getregular.com/`: copy, tokens, fonts, screenshots (screenshots and fonts git-ignored) | copy and tokens |
| VO | the first film's soundtrack, re-cut (`sound/vocut.py`; `audio/` git-ignored) | narration |

Deliberately unused:
- The site's testimonials, the "40%" stat and the gastroenterologist quote: no story beat needs them in 30 s, and each would need its context and disclaimers.
- `amadi` / `quoteFont`, the site's display serif: its licence is a webfont licence that likely doesn't cover video. EB Garamond stands in.
- The first film's illustrations (Maya, the doctor): that is the style being replaced.
- The App Store badge artwork: the CTA is a text pill with the site's own button copy. Use Apple's official badge if the ad needs one.
