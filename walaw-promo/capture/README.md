# Capture scripts

Playwright scripts that produced `../../assets` from https://www.walaw.io/ (run in order; each takes the assets dir).

| Script | Produces |
|---|---|
| `crawl.cjs <url> <assets>` | full-page/section screenshots, `site.json` (text, links, images, CSS vars, colors, fonts) |
| `crawl2.cjs <assets>` | scroll-driven feature states, demo, FR pages, product pages |
| `crawl3.cjs <assets> [en,fr]` | DPR-3 element captures of feature cards and their parts |
| `crawl4.cjs <assets> [en,fr]` | the site's own animations at 30 fps via Playwright's fake clock (`seq/`) |
| `crawl5.cjs <assets>` | the live agent player, Ready → real click on Play → Speaking (`seq/*-player-*`) |
| `crawl6.cjs <assets>` | the hero waveform canvas on transparency (`seq/hero-bars`) |
| `tokens.cjs` | computed gradient / radius / button tokens |

Large capture folders (`assets/seq`, `assets/ui`, `assets/work`, `assets/screens`) are git-ignored: rerun the scripts to regenerate them.
`assets/work` is built from `seq/` and `ui/` by the downscale step described in `../README.md`.
