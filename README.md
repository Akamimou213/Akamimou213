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
| Motion (hero intro, system rail, results tabs, counters, stacking cards) | `src/main.ts` |
| Portrait, social preview image, robots.txt, sitemap.xml, llms.txt | `public/` |
| Intro reel (16:9 + 9:16, MP4 + WebM, posters) | `public/reel/`; source film in `films/portfolio-reel/` (rebuild steps in its README) |

## Content rules

- Every number on the page comes from the résumé or the campaign screenshots, and each one says how it was measured (platform-attributed vs. backend).
- Results are anonymized: no client names, only industry, market and channel. Tables marked "Recreated from Ads Manager" copy the real figures with campaign names redacted.
- Booking links point to Calendly; update them in `index.html` if the link changes.
- The canonical URL, sitemap, robots.txt and Open Graph tags use `https://mohamedbarkat.vercel.app/`. Change them if you move to a custom domain.
- The six system visuals are labelled "Illustration" because they explain the process and don't show client data.
- All motion respects `prefers-reduced-motion`.
