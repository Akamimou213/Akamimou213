# Get Regular: technical and on-page SEO audit

**Site:** https://www.getregular.com · **Audited:** 19 Oct 2026, 07:09–07:20 UTC · **Method:** outside-in only. We had no access to the repo (`avandame/getregular-landing`), Vercel, or Search Console.
**Stack (observed):** Vercel (`server: Vercel`), Next.js App Router. Evidence: `vary: rsc, next-router-state-tree…`, `self.__next_f` RSC payload, `x-nextjs-prerender: 1`, a Turbopack chunk name, and the string `version:"16.2.1"` in chunk `00nvzi6qb_-1r.js`. That string is probably the Next.js version, but this is **unverified**.
**Evidence folder:** `technical/evidence/`, which holds raw curl outputs, parsed HTML, rendered DOM, screenshots and Lighthouse JSON (gzipped) plus summaries. The scripts there (`parse.py`, `render.js`, `nojs.js`, `lhsum.py`) reproduce every check.

> **What changed since the 14 Oct baseline** (`inputs/.../technical/observed-audit.csv`): the site now has a **blog** (`/blog`, plus one post), a **sitemap.xml (200)**, and `apple-app-site-association`. Its `metadataBase` now resolves to the **apex** host (`https://getregular.com/...` in og:image, canonical and sitemap), but the apex host only **307-redirects** to www. `robots.txt` is still 404. OBS07 ("sitemap 404") is therefore out of date.

---

## 1. Findings

Severity scale: **P0** means it actively harms indexing, trust or compliance, so fix now. **P1** means a high-impact gap. **P2** is important. **P3** is hygiene.

| ID | Area | Finding | Evidence | Sev | Fix (Codex task #) |
|---|---|---|---|---|---|
| F01 | Claims / YMYL | The hero badge says **"AI-Powered · Clinically Validated · Available on iOS"**. The stats **"40% of people worldwide"**, **"$3,000+ … per year"** and **"3 years … to get a correct diagnosis"**, and the line **"Thousands of people are already tracking"**, appear with no visible source. A named advisor quote says the app "reliably demonstrat[es] … evidence-based interpretation". "Clinical validation" normally means a published outcome study, and none is cited. | `parsed-raw-html-home.json` text; rendered DOM | **P0** | Remove "Clinically Validated" unless a study exists. Cite each statistic or remove it. A plausible source for the 40% figure is the Rome Foundation Global Epidemiology Study (Sperber et al., *Gastroenterology* 2021), but the team must verify it. Content task: T15 |
| F02 | Canonical host | **Host signals conflict.** www serves 200. The apex `https://getregular.com/` returns **307 (temporary)** to www. Despite that, the **sitemap `<loc>`s, the article canonical, the JSON-LD `mainEntityOfPage` and every og:image** use the apex host, so every declared URL redirects. | `variants.txt`, `headers.txt`, `sitemap.xml.observed`, article `<link rel=canonical href="https://getregular.com/blog/…">` | **P0** | Pick **www** as canonical, because it serves 200 and is the URL search engines show. Set `metadataBase` to www, make apex→www a **308**, and regenerate the sitemap (T1, T2, T4) |
| F03 | Canonical tags | The homepage, `/blog`, `/legal/*` have **no `rel=canonical`**. `/?utm_source=x&gclid=y` returns 200 with no canonical, so tracking URLs can be indexed as duplicates. | `parsed-raw-html-*.json` → `canonical: []` | P1 | Add a self-referencing canonical on every route via `alternates.canonical` (T4) |
| F04 | LCP / rendering | The **H1 and most sections are server-rendered with inline `opacity:0`**: 55 elements, including `<h1 … style="…opacity:0;transform:translateY(24px)">`. They only become visible after JS hydrates and animates them. **With JS off, the first mobile viewport is blank.** In Lighthouse, the LCP element is the H1 with ~97% "render delay". | `shot-home-nojs-mobile.png`; `nojs.js` output `{"h1opacity":"0","hiddenByOpacity":55}`; LH LCP breakdown | **P0** (CWV/UX) | Above-the-fold content must render visible in server HTML. Animate transform only, or use `initial={false}` (T10) |
| F05 | Performance | **Mobile lab: Performance 32–51, FCP 7.8–7.9 s, LCP 22.5–23.5 s, SI 13.9–17.2 s, TTI ~29–31 s, 6.3–7.7 MB transferred** across 3 runs. Desktop: 67–70, LCP 4.4–4.6 s. CLS is 0. There is no field (CrUX) data (see §3). | `evidence/lighthouse/*` | **P1** | Do T10–T13 in order |
| F06 | Third-party weight | Six **TikTok `<iframe>` players** in `#community` and a **YouTube autoplay embed** load eagerly (no `loading="lazy"`). They cause ~**490 requests** per homepage view (TikTok ≈ 400). Third parties account for **4.3 MB of 6.3 MB**. Lighthouse lists TikTok third-party cookies (Best-Practices 79). | `rendered-dom.json` host counts; LH `resource-summary`, `third-party-cookies` | **P1** | Replace them with click-to-load facades and a self-hosted, poster-first video (T11) |
| F07 | Images | `/images/schopis-cropped.png` is **875 KB at 1406×1368, shown at 48×48**, and is `<link rel=preload>`-ed in the head. `/images/home.png` is **743 KB at 684×1410**, shown at 180–260 px, has **no width/height**, and is preloaded. Two `<img>` copies exist, one per breakpoint. Neither uses `next/image`, so both ship as PNG. LH estimates 1.6 MB of savings. | LH `image-delivery-insight`, `unsized-images`; `<link rel=preload as=image>` in raw HTML | P1 | Use `next/image` with `sizes` and AVIF/WebP. Remove the advisor-photo preload. Add a poster to the hero video (T12) |
| F08 | Analytics JS | PostHog (`array.js`, `posthog-recorder.js`, `surveys.js`) loads on every page from an inline snippet in the HTML. It blocked the main thread for **~1.24 s** on mobile and contains ~130 KB of unused JS. Session recording on a health-adjacent site also raises a privacy question. | LH `third-party-summary`, `unused-javascript`; inline `posthog.init('phc_…', {api_host:'https://us.i.posthog.com'})` | P2 | Initialize after idle. Disable recorder and surveys on marketing pages unless the business needs them (T13) |
| F09 | robots.txt | `/robots.txt` → **404**. Nothing is blocked, but there is no sitemap pointer and no declared policy for AI crawlers. | `static-files.txt` | P1 | `app/robots.ts` with the documented AI policy (T3) |
| F10 | Sitemap quality | The sitemap exists, but it uses apex URLs (F02). It has a **future `lastmod` (2026-10-20)** on the post. It lacks `lastmod` on the homepage and legal pages. It sets `priority`/`changefreq`, which Google ignores. Nothing references it (no robots.txt). | `sitemap.xml.observed` | P1 | Generate it from a content registry using real dates (T2) |
| F11 | Future-dated post | The blog post shows **"October 20, 2026"** and `article:published_time=2026-10-20`, but the audit date is 19 Oct 2026. The homepage "From the Journal" card shows the same date. | `parsed-raw-html-blog_*.json` | P2 | Use the real publish date. The registry should refuse future dates in production (T6) |
| F12 | Article E-E-A-T | `BlogPosting` names its **author as an Organization ("Get Regular Team")** and has **no reviewer, no `dateModified`, no publisher logo, and a generic image**. The body links to **no sources** (it mentions the Bristol scale and 1997 but cites nothing). The page has no internal links beyond "← All Posts" and the App Store CTA. There is no visible byline with credentials. | `parsed-raw-html-blog_what-your-poop….json` (`jsonld`) | P1 | Use a Person author, a medical reviewer only where genuine (WebPage `reviewedBy`/`lastReviewed`), a sources list, and breadcrumbs (T6, T7) |
| F13 | OG/social per route | `/blog`, `/legal/privacy-policy` and `/legal/terms-of-service` **inherit the homepage og:title/description** ("Get Regular — Trust Your Gut Again"). There is no `og:url`, `og:site_name` or `twitter:site` anywhere. The og:image (`preview.png`, 916 KB) is referenced via the redirecting apex URL. | `parsed-raw-html-*.json` meta | P2 | Set per-route `openGraph` and `twitter`, compress the OG image (T4) |
| F14 | Title / category clarity | Homepage title "Get Regular — Trust Your Gut Again" names neither "app" nor any tracking job. The H1 "Your gut is talking. Are you listening?" carries no category either. The category words ("gut health tracking", "stool, meals") appear only in the meta description and body. The App Store subtitle already says **"Food, Stool & Symptom Tracking"**. | raw `<title>`, H1 | P1 | Use a category-led title and a visible category line next to the H1 (T4, T15). Wording needs approval |
| F15 | Internal linking / IA | Indexable pages are home, `/blog`, 1 post and 2 legal pages. Nav is mostly `#` section anchors plus `/blog`. There are **no product, FAQ, About/team, "how the AI works" or support pages.** Legal links open in `target="_blank"`. Every guessed route returned 404: `/faq`, `/about`, `/science`, `/support`, `/pricing`, `/learn`, `/privacy`, `/terms`, `/download`, `/food-symptom-tracker`, `/bowel-movement-tracker` and more. | `routes.txt` | P1 | Content plan supplies the pages. Engineering supplies the templates, registry, nav and footer (T5, T6, T9) |
| F16 | Structured data | **The homepage has no JSON-LD**: no Organization, WebSite or MobileApplication. The only JSON-LD on the site is the article's BlogPosting. | raw HTML | P2 | Add an entity graph with stable `@id`s (T7) |
| F17 | App Store links | Every CTA points to the **Canadian storefront** with an old slug (`apps.apple.com/ca/app/get-regular/id6749188690`, which 301s to `/ca/app/get-regular-ai-gut-health/…`). The links carry **no `pt`/`ct` campaign tokens**. The storefront-neutral `apps.apple.com/app/id6749188690` resolved to `/us/` from our US egress. The behavior for US iOS users tapping a `/ca/` link was not tested on a device and is **unverified**. | `rendered-dom.json` links; curl redirects | P1 | Centralize one `AppStoreLink` with a neutral URL plus campaign tokens (T14) |
| F18 | CTA tracking | The JS chunk already contains `posthog.capture("app_store_click",{location})` for `nav`, `mobile_nav` and `sticky_cta`. **No location was found for the article CTA or blog pages** (searched in homepage chunks only, so partly unverified). | `grep app_store_click` in `124f~efm-qklz.js` | P2 | Route every CTA through one component (T14) |
| F19 | Smart App Banner | There is no `<meta name="apple-itunes-app">`. AASA exists at `/.well-known/apple-app-site-association` (`appID 9SGLZLT9FV.com.getregular.app`, paths `/invite/*`, `application/json`). `/invite/[code]` 307s to the CA App Store. | `static-files.txt`, AASA file | P2 | Add `itunes` metadata (T8). Keep AASA unchanged |
| F20 | 404 handling | Random paths return a true **404** with `noindex` (good). The page is the **default Next.js 404**: title "404: This page could not be found.Get Regular — …", no links, no way back. `/_not-found` returns **200** without noindex (low risk because nothing links to it). Uppercase paths 404 rather than redirecting (acceptable). | `routes.txt`, `parsed-raw-html-404.json` | P2 | Add a branded `app/not-found.tsx` with links (T9) |
| F21 | Redirect hygiene | `http://getregular.com/` takes 2 hops (308→https apex, then 307→www). Trailing slash returns 308 to the no-slash URL (good). `/index.html` → 404 (fine). The uppercase host is served normally (fine). | `variants.txt` | P2 (folds into F02) | Make apex→www permanent (T1) |
| F22 | Security headers | There is HSTS `max-age=63072000` but no `includeSubDomains`. **No CSP, X-Content-Type-Options, Referrer-Policy, Permissions-Policy or frame protection.** There is no `x-powered-by` (good). `access-control-allow-origin: *` is set on HTML (Vercel default, low risk). | `headers.txt`; LH `csp-xss`, `has-hsts`, `clickjacking-mitigation` | P2 | `headers()` in next.config, with CSP in Report-Only first (T16) |
| F23 | Fonts | Four font preloads, including **both `.woff` and `.woff2` of the same face** (`able_lead_otf_webfont`). A Roboto file from fonts.gstatic and TikTok Sans files come in through the embeds. | raw `<link rel=preload as=font>` | P3 | Ship WOFF2 only. Preload at most the hero faces (T12) |
| F24 | Accessibility | A11y score 95–96. **Color-contrast failures** on `text-taupe-l…` eyebrow labels, `text-accent` 10 px labels, and footer/nav links. Duplicate H3 sets (desktop and mobile copies of the "How it works" steps, one hidden). | LH `color-contrast`; rendered headings | P3 | Darken the tokens. Render one set of steps (T17) |
| F25 | Icons / manifest | Only `/icon.png` exists (64×64). `/favicon.ico`, `/apple-touch-icon.png` and `manifest.webmanifest` all → 404. | `static-files.txt` | P3 | Add `app/favicon.ico`, `app/apple-icon.png` and `app/manifest.ts` (T17) |
| F26 | Stale / thin signals | Footer reads "© 2025". `/blog` says "New every week" but has 1 post, and its body is only 54 words. The homepage duplicates its marquee and step copy in the DOM. | rendered text | P3 | Use the current year dynamically. Fix copy (T17) |
| F27 | llms.txt / IndexNow | `/llms.txt` → 404 and there is no IndexNow key. Neither is a Google requirement. IndexNow helps Bing/Yandex discovery, and Bing data feeds Copilot and some other engines. | `static-files.txt` | P3 | IndexNow key route and ping script (T18). llms.txt is optional (T19) |
| F28 | Bot access | **All 13 tested user agents got an identical 200 (49,028 B, same body hash)** for home and the article. No Vercel or Cloudflare challenge was seen. Caveat: requests came from our proxy IP with spoofed UAs. Real bot-IP behavior (Vercel Bot Protection or Firewall rules) needs the Vercel Firewall logs, so it remains **unverified**. | `bots.txt` | Pass | Keep. Check Vercel Firewall → Bot management after launch |
| F29 | Index status | Search Console is still unverified or unreadable (`gsc-access-status.json`). The `site:getregular.com` web search (our search tool, **not Google directly**) returned **only the homepage**. No blog or legal URLs appeared. Brand queries return the App Store listing and the homepage. | WebSearch 19 Oct | P0 (ops) | Verify the GSC domain property and submit the sitemap. Bing Webmaster Tools too (T20) |
| F30 | Server HTML parity | Good: title, meta, H1–H3, all body copy and all `<a href>` links are present in the server HTML. Raw word count 745 vs rendered 632–641 (raw includes hidden duplicates). There are no JS-only links. The mobile nav links are in the DOM, hidden behind a "Menu" button. `lang="en"` is set. There is no hreflang, which is correct for one language. | `parsed-raw-html-home.json` vs `rendered-dom.json` | Pass | Preserve it |

---

## 2. HTTP and host matrix (19 Oct 2026)

| Request | Result |
|---|---|
| `http://getregular.com/` | 308 → `https://getregular.com/` → **307** → `https://www.getregular.com/` (2 hops) |
| `https://getregular.com/` | **307** → `https://www.getregular.com/` |
| `http://www.getregular.com/` | 308 → https www |
| `https://www.getregular.com/` | 200, `x-vercel-cache: HIT`, `x-nextjs-prerender: 1`, br-compressed, `cache-control: public, max-age=0, must-revalidate` |
| `/legal/privacy-policy/` (trailing slash) | 308 → no slash ✔ |
| `/LEGAL/PRIVACY-POLICY` | 404 |
| `/?utm_source=test&gclid=abc` | 200, no canonical ✘ |
| `/this-page-does-not-exist-xyz123` | **404** + `<meta name="robots" content="noindex">` ✔ |
| `/_not-found` | 200 (no noindex) |
| `/invite/<code>` | 307 → `apps.apple.com/ca/app/get-regular/id6749188690`, `cache-control: private, no-store` |

**Headers present:** `strict-transport-security: max-age=63072000`, `server: Vercel`, `vary: rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch`, `etag`, `content-encoding: br`, `access-control-allow-origin: *`.
**Absent:** `x-robots-tag` (fine), `x-powered-by` (good), CSP, `x-content-type-options`, `referrer-policy`, `permissions-policy`, `x-frame-options`.

## 3. Discovery files

| Path | Status | Notes |
|---|---|---|
| `/robots.txt` | **404** | No policy and no sitemap reference |
| `/sitemap.xml` | 200 `application/xml` | 5 URLs, all **apex** (`https://getregular.com/...`). Post lastmod `2026-10-20` (future) |
| `/sitemap_index.xml`, `/sitemap-0.xml` | 404 | n/a |
| `/llms.txt`, `/llms-full.txt` | 404 | Optional |
| `/.well-known/apple-app-site-association` | 200 `application/json` | `applinks` → `9SGLZLT9FV.com.getregular.app`, `/invite/*` |
| `/apple-app-site-association` (root) | 404 | The `.well-known` location is the one iOS uses, so this is fine |
| `/icon.png` | 200, 64×64 | Linked via `rel=icon` |
| `/favicon.ico`, `/apple-touch-icon.png`, `/apple-icon.png`, `/manifest.webmanifest` | 404 | n/a |
| `/images/preview.png` (OG) | 200, 1200×630, **916 KB** | Referenced via the apex URL |
| `/.well-known/security.txt` | 404 | Optional |

**CrUX / PageSpeed:** the CrUX API without a key returned `403 PERMISSION_DENIED` ("unregistered callers"). The PageSpeed API returned `429`. **No field data was available to us.** Whether the origin even has CrUX data is unknown, and it is unlikely given the low traffic.

## 4. Bot access matrix (homepage + article, same IP, spoofed UA)

| User agent | Home | Bytes | Body hash* | Article |
|---|---|---|---|---|
| Chrome 130 | 200 | 49,028 | d3c92ba3 | 200 |
| Googlebot (smartphone) | 200 | 49,028 | d3c92ba3 | 200 |
| Bingbot | 200 | 49,028 | d3c92ba3 | 200 |
| OAI-SearchBot | 200 | 49,028 | d3c92ba3 | 200 |
| ChatGPT-User | 200 | 49,028 | d3c92ba3 | 200 |
| GPTBot | 200 | 49,028 | d3c92ba3 | 200 |
| PerplexityBot / Perplexity-User | 200 / 200 | 49,028 | d3c92ba3 | 200 |
| ClaudeBot / Claude-SearchBot / Claude-User | 200 ×3 | 49,028 | d3c92ba3 | 200 |
| Applebot | 200 | 49,028 | d3c92ba3 | 200 |
| CCBot, curl | 200 | 49,028 | d3c92ba3 | 200 |

\*The hash is of the body after stripping the per-request `x-vercel-id`. There was no challenge page or cloaking. Because the page is a static prerender, non-JS crawlers (most AI fetchers) receive the full copy and links. Those elements carry `opacity:0`, but the text is in the HTML.

## 5. Lighthouse 12.8.2 (local Chromium 1194, simulated throttling, 19 Oct 2026)

| Page / form factor | Perf | A11y | BP | SEO | FCP | LCP | TBT | CLS | SI | Weight |
|---|---|---|---|---|---|---|---|---|---|---|
| Home mobile (run A, concurrent with Playwright) | 32 | 96 | 79 | 100 | 7.8 s | 22.5 s | 1,160 ms | 0 | 17.2 s | 6.3 MB |
| Home mobile (run B, isolated) | 46 | n/a | n/a | n/a | 7.9 s | 23.1 s | 370 ms | 0 | 13.9 s | 7.7 MB |
| Home mobile (run C, isolated) | 51 | n/a | n/a | n/a | 7.9 s | 23.5 s | 240 ms | 0 | 16.2 s | 6.3 MB |
| Home desktop (2 runs) | 70 / 67 | 96 | 78 | 100 | 1.0–1.2 s | 4.4–4.6 s | 30–40 ms | 0 | 2.9–3.6 s | 5.6–5.8 MB |
| `/blog` mobile | 81 | 95 | 100 | 100 | 0.8 s | 4.4 s | 210 ms | 0 | 3.0 s | 590 KB |
| Article mobile | 81 | 95 | 100 | 100 | 1.2 s | 4.6 s | 170 ms | 0 | 3.3 s | 527 KB |

- **LCP element (home):** the `<h1>` "Your gut is talking. Are you listening?". TTFB is about 680 ms (3%) and render delay about 21.9 s (97%). The cause is the server-side `opacity:0` and the JS-driven reveal. The ~8 s FCP has the same cause: nothing contentful is visible until hydration.
- **Blog/article LCP:** text paragraphs have ~3.8 s render delay, with no `opacity:0` present. The likely causes are hydration/JS contention and web-font swap. This is **not confirmed**, so re-measure after T12/T13.
- **Render-blocking:** 1 CSS file (`/_next/static/chunks/0_eixglinl4uv.css`, 9.4 KB), est. 80–370 ms.
- **First-party JS:** 10 chunks, **~255 KB brotli / ~811 KB raw**. Largest: `00nvzi6qb_-1r.js` 72 KB br, `124f~efm-qklz.js` 53 KB br, `03~yq9q893hmn.js` 41 KB br, `0vxi98ewbbk5w.js` 40 KB br. Unused JS is about 202 KB (PostHog ~130 KB). Legacy JS polyfills are about 41 KB.
- **Images:** 2.0 MB, almost all from the two PNGs (F07). **Media:** hero `onboarding-v1.mp4` (~670–750 KB, autoplay, no poster, 1 h cache from GCS).
- **Requests:** 506 (487 third-party). Hosts: TikTok ≈ 400, YouTube ≈ 20, PostHog 4.
- **SEO audits:** 100. `canonical` and `structured-data` are "not applicable" because they are absent. The 100 does **not** mean SEO is complete.

## 6. Page inventory (all discoverable URLs)

| URL | Status | Title | Meta description | Canonical | H1 | Indexable | Words (raw) |
|---|---|---|---|---|---|---|---|
| `/` | 200 | Get Regular — Trust Your Gut Again | AI-powered gut health tracking. Analyze your stool, meals, and biomarkers… board-certified gastroenterologist. | none | Your gut is talking. Are you listening? | Yes (no robots meta) | 745 |
| `/blog` | 200 | The Journal — Get Regular | Weekly reads on gut health, digestion, and feeling regular, from the Get Regular team. | none | The Journal | Yes | 58 |
| `/blog/what-your-poop-is-trying-to-tell-you` | 200 | What Your Poop Is Trying to Tell You — Get Regular | A friendly guide to the Bristol Stool Scale, the 7-type chart doctors actually use to talk about poop. | `https://getregular.com/blog/…` (**apex, redirects**) | What Your Poop Is Trying to Tell You | Yes | 396 |
| `/legal/privacy-policy` | 200 | Privacy Policy — Get Regular | How we handle and protect your information. | none | Privacy Policy | Yes | 1,319 |
| `/legal/terms-of-service` | 200 | Terms of Service — Get Regular | Get Regular Terms of Service. | none | Terms of Service | Yes | 656 |
| `/invite/[code]` | 307 → App Store | n/a | n/a | n/a | n/a | No (redirect) | n/a |
| 30+ guessed routes | 404 | n/a | n/a | n/a | n/a | No | n/a |

**Homepage outline (server HTML):** H1 "Your gut is talking. Are you listening?". Then H2 "You've been flushing your most powerful biomarker." (#problem) and H2 "We turn gut feelings into gut data." (#how), followed by H3 ×5 (Snap it / We analyze it / See your scores / Get your plan / Watch it work), **duplicated** for the mobile and desktop layouts. Then H2 "The community is talking." (#community, 6 TikTok iframes), H2 "Gut feelings. Confirmed." (4 testimonials attributed to "Midwife" and "App user"), H2 "Built with a gastroenterologist, not just an algorithm." (#science, Dr. Michael Schopis, MD, with photo and quote), H2 "Fresh reads for a happier gut." (#journal, 1 card), and finally H2 "It's time to Get Regular."

**Links on home:** internal links are `/blog` (×2), the article, `/legal/privacy-policy` and `/legal/terms-of-service` (both `target=_blank`), plus 5 `#` anchors. External links: App Store CA (×2; a third is the sticky CTA), TikTok, Instagram, LinkedIn (×2 each, `rel="noopener noreferrer"`, no nofollow), and `mailto:hello@getregular.com`. No JS-only links were found.

**Images on home:** logo SVGs have alt text and dimensions. `home.png` has alt "Get Regular home screen" but no dimensions, no lazy loading and no `next/image`. `schopis-cropped.png` has alt "Dr. Michael Schopis" and no dimensions. All images have alt text.

## 7. On-page content audit (homepage)

**Search intent fit**

| Query cluster | Does the homepage answer it? | Gap |
|---|---|---|
| "gut health app" | Partly. "AI-powered gut health tracking" appears in the meta description only. The visible copy says "Get Regular analyzes your stool, meals, symptoms and biomarkers". | No "app" plus category wording in the title or H1. No mention of iPhone in the hero copy beyond the badge |
| "poop tracker app" / "stool tracker" / "bowel movement tracker" | Weakly. "AI stool analysis" appears in the marquee and "Photo your food, stool, and symptoms" in the steps. | No mention of the **Bristol scale** on the homepage, although the App Store listing leads with it. No manual-logging explanation and no screenshot of stool history |
| "food and symptom tracker" | Weakly. "meals, symptoms", "Find your triggers", "Full nutrition breakdown". | There is no explanation of how meals are correlated with symptoms, and no example output |
| Trust / "is it safe/private" | No. The privacy policy (OpenAI API processing, photos not stored) is only reachable from the footer. | No "How the AI works / privacy" section or page |

**Claims needing evidence or rewording** (owner and qualified-reviewer sign-off required):
1. "Clinically Validated" (hero badge) needs a published validation study. Otherwise replace it, for example with "Built with a board-certified gastroenterologist".
2. "40% of people worldwide struggle with gut health issues": a likely source is Sperber et al., 2021, which reported ~40% meeting criteria for a functional GI disorder. Cite it with exact wording, or soften.
3. "$3,000+ … per year" and "3 years … to get a correct diagnosis" have no source. Remove them or cite them.
4. "Thousands of people are already tracking" needs internal data. Apple shows 13 US ratings (iTunes Lookup, 19 Oct).
5. "AI cross-references everything against clinical GI guidance" and the advisor quote "reliably demonstrating…" need the advisor's written approval and a methods page.
6. "Personalized dietary and **supplement** recommendations" is health advice. It needs a disclaimer near the claim, and the medical disclaimer currently sits only in the ToS.
7. Testimonials ("Midwife", "App user") need documented permission and a clear statement that they are user testimonials. No outcomes should be implied as typical.

**E-E-A-T signals:** one is present: a named clinical advisor (Dr. Michael Schopis, MD; NY Presbyterian · Weill Cornell · Manhattan Gastroenterology) with photo and quote. Missing: a link to his profile or bio, an About/team page with the founder and company (legal entity "Get Regular Health, Inc." appears only in the footer), a methods page, editorial policy, medical reviewer bylines on articles, contact or support beyond email, and dates on claims.
**FAQ:** none. Use plain FAQ content for users. Google no longer shows FAQ rich results, so add no FAQPage markup for that purpose.
**CTA placement:** there are App Store CTAs in the nav, a sticky mobile CTA and the final section, plus the article end. The article CTA has no product context. There are no mid-page CTAs after "How it works" or after the Science section.
**Internal linking:** the homepage links only to `/blog` and one article. The article does not link back to product sections, the advisor or related content.

## 8. Index status

- **Google Search Console:** `sc-domain:getregular.com` is listed, but `siteUnverifiedUser` and `readable:false` (14 Oct evidence, not re-checked). No first-party index data is available.
- **Web search (our WebSearch tool, not Google itself), 19 Oct:** `site:getregular.com` returned only `https://www.getregular.com/` ("Get Regular — Trust Your Gut Again"). Brand queries return the US App Store listing (`/us/app/get-regular-ai-gut-health/id6749188690`), its reviews page and the homepage. Search snapshots still show stale App Store data ("by Athina Vandame", 11 ratings). A different company, "Regulars" (`getregulars.com`), competes for the brand name.
- **Conclusion:** the www homepage is indexed in at least one engine. The blog and legal pages were not observed in the index. The blog is days old and the post is future-dated. **The Google index state is unverified** until GSC access exists.

## 9. What was not verified

Google-selected canonical, real-bot IP handling in the Vercel Firewall, field Core Web Vitals, how the US iOS App Store handles `/ca/` links, the PostHog event schema beyond the homepage chunk, the exact Next.js version, the repo's blog/content implementation (MDX vs TS objects), and Bing index status.
