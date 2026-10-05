# Mohamed Barkat — portfolio & services site

Static, single-page site built with Vite, GSAP (ScrollTrigger) and Lenis. All content is plain HTML in `index.html`, so search engines and AI crawlers can read it without running JavaScript.

## Run

```sh
npm install
npm run dev        # local dev server
npm run build      # production build to dist/ (deploy this, e.g. Vercel)
npm run build:single  # one self-contained HTML file in dist-single/ for sharing a preview
```

On Vercel: framework preset **Vite**, build command `npm run build`, output directory `dist`.

## Where things live

| What | File |
|---|---|
| Copy, results, sections | `index.html` |
| Design tokens (colours, type, spacing) | top of `src/styles.css` |
| Motion (hero intro, system rail, counters, stacking cards) | `src/main.ts` |

## Content rules

- Every number on the page comes from the résumé or the campaign screenshots, and each one says how it was measured (platform-attributed vs. backend).
- Results are anonymized: no client or employer names, only industry, market and channel.
- The six system visuals are labelled "Illustration" because they explain the process and don't show client data.
- All motion respects `prefers-reduced-motion`.
