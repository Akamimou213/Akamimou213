# Assets — Get Regular film

| Asset | Source | Used |
|---|---|---|
| `app/logo-white.svg` | getregular.com `/logo-white.svg` (captured 2026-10-29) | end card |
| `app/home.png` | getregular.com `/images/home.png`, the app home screen in a device frame | shot 7 (log it) |
| `fonts/InterTight-*.ttf` | Google Fonts, SIL OFL 1.1 (`fonts/OFL-InterTight.txt`); the site's headline face | every line and the tagline |
| `fonts/DMSans.woff2` | the site's own DM Sans (SIL OFL 1.1) | CTA and the disclaimer |
| `capture/` | `capture.cjs site https://www.getregular.com/`: copy, tokens, fonts, screenshots (screenshots and fonts git-ignored) | palette, copy |
| Maya and the doctor | designs from the first film (`share_9_1.mp4`), redrawn in code | the characters |
| VO | the first film's soundtrack, re-cut (`sound/vocut.py`; `audio/` git-ignored) | narration |

Deliberately unused:
- The site's testimonials, the "40%" stat and the gastroenterologist quote: no story beat needs them in 30 s, and each would need its context and disclaimers.
- `amadi` / `quoteFont`, the site's display serif: its licence is a webfont licence that likely doesn't cover video. The logo SVG carries that serif instead.
- The first film's illustration files: the characters are redrawn so they live in the new palette and can change expression.
- The App Store badge artwork: the CTA is a text pill with the site's own button copy. Use Apple's official badge if the ad needs one.
