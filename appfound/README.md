# Appfound — marketing site

Single-page site for Appfound, the growth partner for consumer apps. Built with Vite, GSAP (ScrollTrigger) and Lenis. All copy is plain HTML in `index.html`, so search engines and AI crawlers can read it without running JavaScript.

Design direction: The Patch System (electric blue, ruled panels, condensed caps, numbered boxes, scroll-highlight list, bucket metaphor) with Tines for the story arc (problem → solution → proof → CTA), editorial serif accents and the tabbed product-UI panel.

## Run

```sh
cd appfound
npm install
npm run dev           # local dev server
npm run build         # production build to dist/
npm run build:single  # one self-contained HTML file in dist-single/ for sharing a preview
```

Vercel: set **Root Directory** to `appfound`, framework preset **Vite**, build `npm run build`, output `dist`.

## Before going live

1. **`src/config.ts` → `formEndpoint`**: where Growth Plan requests are POSTed as JSON (Formspree, Web3Forms, a Make/Zapier webhook or your own API). Until it's set, the form copies the request and sends people to LinkedIn so no lead is lost, but that path converts worse.
2. **`src/config.ts` → `siteUrl`**: the live domain, used in the "Ask AI about Appfound" prompts. Also add `<link rel="canonical">` and make `og:image` absolute in `index.html`.
3. **Tracking**: add GTM / Meta Pixel / TikTok Pixel. `src/track.ts` already pushes `cta_*` clicks and `growth_plan_submit` to `dataLayer`, and fires `Lead` / `SubmitForm` on the pixels with non-personal fields only. The form also captures first-touch UTMs and click IDs (gclid, fbclid, ttclid) into the lead payload.

## Where things live

| What | File |
|---|---|
| Copy, sections, FAQ, schema.org | `index.html` |
| Design tokens (colours, type) | top of `src/styles.css` |
| Hero intro, scroll highlight, tabs, counters, menu | `src/main.ts` |
| Leaky-funnel canvas animation | `src/bucket.ts` |
| Growth Plan form, App Store search (iTunes Search API), UTM capture | `src/form.ts` |
| Proof screenshots (cropped and redacted), portrait, OG image | `public/img/`, `public/og.png` |
| Explainer film (16:9, 9:16 for phones, reduced-motion cut, captions, posters) | `public/film/`; source in `films/appfound-film/` |
| Full audit of v1 → v2 changes and open items | `docs/AUDIT.md` |

## Content rules

- Every result names where it was measured (Meta Ads Manager = platform-reported; product analytics; App Store Connect).
- Product UI mockups in the Channels tabs are labelled "Illustration" because they explain the work and don't show client data.
- External stats are sourced: "almost 65% of App Store downloads happen right after a search" (Apple Ads, 2022 data); "creative drove 56% of sales lift in digital campaigns" (Nielsen / NCSolutions, ~500 campaigns, 2017).
- All motion respects `prefers-reduced-motion`.
