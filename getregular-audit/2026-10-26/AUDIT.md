# Get Regular: post-launch audit of the new website

**Site:** https://www.getregular.com · **Audited:** 26 Oct 2026, 09:09–09:40 UTC · **Method:** outside-in (no access to the repo, Vercel, Search Console, PostHog or App Store Connect).
**Baseline:** the 19 Oct 2026 audit (`getregular-seo/technical/technical-audit.md` on branch `claude/zealous-brahmagupta-422bbt`, findings F01–F30). The old site had 5 URLs. The new one has 112.
**Evidence:** `evidence/` holds the page inventory, HTTP matrix, headers, robots/sitemap snapshots, outbound-link status, the PubMed lookup, Lighthouse JSON (gzipped) and mobile screenshots. `scripts/` reproduces the crawl, link graph and render checks.

---

## 1. Verdict

The relaunch fixed most of the Oct 19 technical debt. All 112 sitemap URLs return 200, each has a self-referencing www canonical and one H1, and content is visible without JavaScript. Homepage mobile LCP fell from 22–23 s to 3.1–3.4 s. Accessibility, Best Practices and SEO scored 100 on every page tested. The unsupported claims ("Clinically Validated", the $3,000 and 3-year figures, "Thousands of people") are gone.

What is left is mostly not code hygiene. The open problems are **measurement, trust and indexing**:

1. **No install attribution from the site.** The CTA code supports Apple campaign tokens, but the provider-token env var is not set in production, so all 337 App Store links are bare.
2. **PostHog cannot see which pages work.** Its privacy filter rewrites every content URL to `/not-found` and drops UTMs and click IDs.
3. **The product pages talk about Get Regular from the outside** ("These features appear in public descriptions or release notes… check your app version"). That undermines trust and conversion on the pages meant to sell.
4. **85 health articles went live on one day** under an organizational byline, with no named reviewer and no dateModified. Two of them cite a **retracted** paper.
5. **Search engines haven't caught up.** The only engine we could test (not Google) still indexes just the homepage, with the *old* snippet that includes "Clinically Validated".

---

## 2. Oct 19 findings: status

| ID | Oct 19 finding | Status 26 Oct | Evidence |
|---|---|---|---|
| F01 | Unsupported claims / YMYL | **Fixed** on homepage. 40% stat now qualified and linked to the study; testimonials labelled "not typical results"; advisor quote followed by "advisory review is distinct from a clinical validation study" | crawl text |
| F02 | Canonical host conflict | **Mostly fixed.** Canonicals, sitemap, OG and JSON-LD all use www. Apex still **307** (temporary), and `http://getregular.com/` still takes 2 hops | `http-matrix.tsv` |
| F03 | No canonicals | **Fixed.** 112/112 self-canonical; `/?utm_source=x&gclid=y` canonicalizes to `/` | inventory |
| F04 | H1 hidden by `opacity:0` | **Fixed.** 0 inline `opacity:0` in server HTML; H1 visible with JS off | screenshots, `rendered-mobile.json` |
| F05 | Mobile perf 32–51, LCP 22–23 s | **Fixed / improved.** Home mobile 73–88, LCP 3.1–3.4 s; desktop 100 | Lighthouse |
| F06 | 6 TikTok iframes + YouTube eager | **Fixed.** Click-to-load facades; ~29 requests on mobile (was ~490) | Lighthouse |
| F07 | 875 KB / 743 KB PNGs | **Fixed.** `next/image` throughout. New issue: 3.2 MB hero video (N07) | Lighthouse |
| F08 | PostHog weight, session recording | **Partly fixed.** Recording off, autocapture off, identified-only profiles. Still 142 KB third-party JS incl. `surveys.js` | Lighthouse |
| F09 | robots.txt 404 | **Fixed.** Policy + sitemap pointer (see N15) | `robots.txt.observed` |
| F10 | Sitemap quality | **Partly fixed.** www URLs, 112 entries; 27 non-article URLs lack `lastmod` (N11) | `sitemap.xml.observed` |
| F11 | Future-dated post | **Fixed** (old post 308s to `/learn/bowel-health/bristol-stool-scale`; dates are 20 Oct) | HTTP matrix |
| F12 | Article E-E-A-T | **Open** (N04) | JSON-LD |
| F13 | OG per route | **Fixed** titles/descriptions; one shared 916 KB image (N10) | inventory |
| F14 | Category-less title/H1 | **Fixed.** "Gut Health App for Food, Stool & Symptom Tracking" | inventory |
| F15 | No product/FAQ/about/science pages | **Fixed.** `/app/*` (5), `/science/*` (7), `/about`, `/faq`, `/explore/*` (3), `/learn/*` (92) | sitemap |
| F16 | No homepage JSON-LD | **Fixed.** Organization, WebSite, MobileApplication with stable `@id`s; BreadcrumbList; Article | inventory |
| F17 | Canadian storefront links | **Fixed** (storefront-neutral `apps.apple.com/app/id6749188690`). Campaign tokens still missing (N01) | link graph |
| F18 | CTA tracking gaps | **Fixed** in code: one component fires `app_store_click` with `location`, `campaign`, `cluster`. Page path is masked (N02) | JS chunk |
| F19 | No Smart App Banner | **Fixed** (`app-id=6749188690` on every page; no campaign token) | inventory |
| F20 | Default 404 | **Fixed** (branded, true 404 + noindex). Minor leftovers (N13) | `rendered-mobile.json` |
| F21 | Redirect hops | **Open** (see F02) | HTTP matrix |
| F22 | Security headers | **Mostly fixed.** nosniff, Referrer-Policy, Permissions-Policy, X-Frame-Options added. CSP is Report-Only **with no reporting endpoint**; HSTS lacks `includeSubDomains` (N14) | `home-headers.txt` |
| F23 | Duplicate font formats | **Open (minor).** `able_lead` still ships `.woff` and `.woff2` | Lighthouse |
| F24 | Contrast, duplicate H3s | **Fixed.** A11y 100 on all 6 runs | Lighthouse |
| F25 | Icons / manifest | **Fixed.** `favicon.ico`, `apple-icon.png`, `manifest.webmanifest` with `related_applications` | HTTP matrix |
| F26 | "© 2025", thin blog | **Fixed** | crawl text |
| F27 | llms.txt / IndexNow | **Open.** `/llms.txt` 404 (a drop-in exists on branch `claude/sleepy-faraday-jhljne`) | HTTP matrix |
| F28 | Bot access | **Pass.** Googlebot, Bingbot, OAI-SearchBot, GPTBot, PerplexityBot, ClaudeBot, Claude-SearchBot, Applebot, CCBot: identical 200 | curl |
| F29 | Index status | **Open / worse relative to site size** (N06) | WebSearch |
| F30 | Server HTML parity | **Pass** | crawl vs render |

---

## 3. New findings

Severity: **P0** fix this week (money or trust leaking now) · **P1** high impact · **P2** important · **P3** hygiene.

| ID | Area | Finding | Evidence | Sev | Fix |
|---|---|---|---|---|---|
| N01 | Install attribution | The `AppStoreLink` component appends `pt` and `ct` only when `NEXT_PUBLIC_APP_STORE_PROVIDER_TOKEN` is set. It isn't, so **all 337 CTA links ship as bare `apps.apple.com/app/id6749188690`**, and the Smart App Banner has no campaign token either. App Store Connect cannot attribute a single website-driven download, by page, cluster or campaign. The `campaign` values are already wired (e.g. `website-header`). | JS chunk: `(u=env.NEXT_PUBLIC_APP_STORE_PROVIDER_TOKEN)&&i&&(s.searchParams.set("pt",u),s.searchParams.set("ct",…))`; link graph | **P0** | In App Store Connect → Analytics → Acquisition → Campaigns, generate one campaign link to obtain the account's provider token. Set it as `NEXT_PUBLIC_APP_STORE_PROVIDER_TOKEN` in Vercel **Production** and **redeploy** (`NEXT_PUBLIC_*` is inlined at build time). Add `affiliate-data=pt=…&ct=web-banner` to the `apple-itunes-app` meta. Keep `ct` ≤ 30 chars. Verify by viewing source. Campaigns appear in App Analytics after >1 day and ≥5 attributed units ([Apple: Campaign links](https://developer.apple.com/help/app-store-connect-analytics/acquisition/campaign-links/)) |
| N02 | Web analytics | PostHog `before_send` rewrites any URL/path not in `["/","/app","/invite"]` to **`/not-found`**, and deletes `utm_*`, `gclid`, `fbclid`, `ttclid`, `msclkid`. So 110 of 112 pages report as `/not-found`, real 404s are indistinguishable from content, and no traffic source is attributable. The privacy intent is right: health-condition URLs sent to a third party are a regulatory risk. The implementation discards more than it needs to. | inline `posthog.init` in `home.html` | **P1** | Map paths to coarse, non-condition buckets instead of `/not-found`: `/learn/<cluster>`, `/app/<feature>`, `/science`, `/explore/<tool>`, and a real `/404`. Keep `utm_source`/`utm_medium`/`utm_campaign` (they don't describe the user's health) and still drop click IDs. Get counsel to sign off on the bucket list. Use **Search Console** for page-level organic performance, since it is first-party and needs no tracking |
| N03 | Product copy / trust | Product, About and FAQ pages describe the company from the outside: "The App Store release history describes a PDF export; check your installed version and offer" (`/app/doctor-report`). "These features appear in public descriptions or release notes… Check your app version" (`/faq`). "The public Get Regular website identifies… Dr. Michael Schopis" (`/about`). "the developer named on the App Store" (`/about`). Hits: `/app/*` 5 pages, `/faq`, `/about`. Price and trial terms are never stated (the app is listed as Free, v2.0.1). | crawl text; iTunes Lookup | **P1** | The product team rewrites these 7 pages in the first person from verified facts: features in the current version, what's free vs paid, price and trial, real screenshots per feature. Remove all "release history / public listing / check your version" phrasing |
| N04 | E-E-A-T at scale | **85 YMYL articles**, all `datePublished 2026-10-20`, none with `dateModified`, `image` or `reviewedBy`. Author is the Organization "Get Regular Editorial Team". No named person appears on `/about` (no founder or team). The only named expert is the advisor, and the site itself says advisory review is not medical review of every article. Median article is ~2,450 words, and the content is careful and well sourced. The *signals* around it are thin for health content published in bulk. | Article JSON-LD; `/about` text | **P1** | Name an editor with a bio page. Start clinician review on the ~15 highest-intent articles (diarrhea, mucus, when-to-see-a-doctor, IBS diagnosis), with visible "Reviewed by … on …" and `reviewedBy`/`lastReviewed` on WebPage, only where genuine. Add `dateModified` on real edits. Add founder/team to `/about`. Add article images (Article rich results expect one) |
| N05 | Citation integrity | **PMID 28690131** (Storhaug 2017, global lactose malabsorption) was **retracted** (retraction notice PMID 39674208). It is cited for "about 68%" / "about two-thirds of adults malabsorb lactose" on `/learn/symptoms/dairy-bloating` and `/learn/symptoms/coffee-and-bloating`. The other 81 PubMed IDs resolve to real papers on matching topics. Four outbound links return 404: 3 FTC URLs (Health Breach Notification Rule pages and the Flo infographic PDF) and the NICE Bristol chart PDF. | `pubmed-esummary.json`, `outbound-link-status.txt` | **P1** | Replace the retracted source and re-word both claims (the editorial reviewer picks the replacement). Fix the 4 dead links. Add a retraction check (PubMed `esummary` → retraction notices) and an outbound 404 check to the content validator, run monthly |
| N06 | Indexing | The search tool we could use (not Google) returns **only the homepage**, with the **old** title and snippet ("Trust Your Gut Again… AI-Powered · Clinically Validated"). None of the 111 new URLs appeared. A query for the Bristol guide returned no getregular.com result. | WebSearch, 26 Oct | **P1 (ops)** | Search Console (domain property): submit `sitemap.xml`, URL-inspect + request indexing for `/`, `/app`, `/learn` and the 5 cluster hubs. Bing Webmaster Tools: import from GSC, submit the sitemap, add IndexNow. Track "Indexed" count weekly. Until the homepage is recrawled, the old "Clinically Validated" snippet stays visible in search |
| N07 | Performance | Homepage hero video `onboarding-afd142c5.mp4` is **3.2 MB = 83% of page weight** (3.9 MB total) and is fetched on mobile. `/app/poop-tracker` LCP is **4.1 s**: the hero `fill` image waits ~1.3 s to be discovered (no `priority`). Mobile TBT is 250–780 ms; PostHog `array.js` + `surveys.js` = 142 KB and 190–210 ms of main thread on every page. | Lighthouse | **P2** | Mobile video at ≤1 MB (720p, H.264/HEVC, ~1 Mbps), loaded on intersection. Add `priority` to above-the-fold `next/image` heroes on `/app/*` and `/explore/*`. Load PostHog after `requestIdleCallback`, and drop surveys if unused |
| N08 | Host redirects | `https://getregular.com/*` → **307** to www; `http://getregular.com/` takes 2 hops. | `http-matrix.tsv` | **P2** | In Vercel → Domains, set the apex redirect to **308 permanent** |
| N09 | Titles | 84 of 112 titles exceed 60 characters (Google truncates around 580 px). Some double the brand ("Get Regular App: … \| Get Regular"). 24 descriptions exceed 160. | `page-inventory.csv` | **P3** | Front-load the query term and trim the worst ~20 (tracking and comparison pages) first. Low priority, because Google rewrites titles often |
| N10 | Social previews | All 112 pages share `/images/preview.png` (916 KB). Shared articles look identical in iMessage, WhatsApp, X and LinkedIn. | inventory, headers | **P2** | Compress to <200 KB. Generate per-article OG images (`opengraph-image.tsx`) with the title and cluster |
| N11 | Sitemap | 85 article URLs share `lastmod 2026-10-20`; 27 hub, product, science and legal URLs have no `lastmod`. | `sitemap.xml.observed` | **P3** | Emit `lastmod` from real content-modified dates for every URL |
| N12 | Internal links | 13 articles have ≤2 inbound internal links (e.g. `creatine-bloating`, `mucus-in-stool`: 1 each). 34 pages have <5. The Gut Health cluster has 1 article, and its hub is 363 words. | link graph | **P2** | Add "related" blocks driven by cluster and intent. Link each article from its hub and from 2–3 siblings. Grow or fold the Gut Health cluster |
| N13 | 404 page | The 404 response carries **two** robots metas (`noindex` and `index, follow`) and the homepage `<title>`. `/_not-found` returns 200. | `404.html` | **P3** | Remove the inherited `index, follow` and set the title to "Page not found" |
| N14 | Headers / files | `Content-Security-Policy-Report-Only` has **no `report-uri`/`report-to`**, so violations are never collected and enforcement can't be planned. HSTS lacks `includeSubDomains`. `/llms.txt` and `/.well-known/security.txt` 404. | `home-headers.txt` | **P3** | Add a report endpoint (Vercel log drain, Sentry or report-uri), review for 2 weeks, then enforce. Add `includeSubDomains` once all subdomains are HTTPS. Ship the prepared `llms.txt` |
| N15 | Crawler policy | robots.txt allows **AI training** crawlers (GPTBot, ClaudeBot, CCBot, Google-Extended) through the `*` group. The named group repeats `*` and changes nothing. `Host:` is non-standard and ignored by Google. | `robots.txt.observed` | **Decision** | Confirm that allowing training is intentional. It's a business choice, not an error. Search and answer bots (OAI-SearchBot, Claude-SearchBot, PerplexityBot) should stay allowed either way |

---

## 4. Next steps

### This week (≈1 engineering day + ops)
1. **N01 Turn on App Store campaign attribution.** One env var, a redeploy and a banner meta change. This is the highest-value change in the audit: without it, no web→install number exists.
2. **N06 Search Console and Bing.** Submit the sitemap and request indexing for the homepage and hubs. This replaces the stale "Clinically Validated" snippet. If GSC access is still blocked (it was on 14 Oct), resolving that comes first.
3. **N05 Retracted citation and 4 dead links.** Two pages; editorial fix.
4. **N08 Apex 307→308.** A Vercel domain setting.

### Next 30 days
5. **N03 Rewrite the 5 product pages, FAQ and About** with first-party facts, price/trial terms and real screenshots. Pair it with N01 so the effect on App Store conversion is measurable by campaign token.
6. **N02 Fix the PostHog path masking** to cluster buckets plus UTMs, after a privacy/legal review.
7. **N04 E-E-A-T layer:** named editor, clinician review of the top ~15 articles, `dateModified`, team on `/about`.
8. **N07 Performance:** compress the hero video and prioritize hero images on `/app/*` and `/explore/*`.

### 60–90 days
9. **N12 internal linking, N10 OG images, N09 titles, N11 sitemap dates, N13–N14 hygiene.**
10. **Measure what the relaunch is for.** Before adding more content, the dashboard should show GSC impressions/clicks by cluster → `app_store_click` by `cluster`/`campaign` (PostHog) → first-time downloads by `ct` (App Store Connect) → trial/subscription by campaign if the subscription backend can join on it. Rankings and traffic alone don't show whether content drives installs.

### Decisions needed from the team
- Is training-crawler access (N15) intended?
- Who is the named editor and which clinician will review articles (N04)?
- Which analytics properties is legal comfortable sending to PostHog (N02)?

---

## 5. Lighthouse 12.8.2 (local Chromium, simulated mobile throttling, 26 Oct 2026)

| Page | Form | Perf | A11y | BP | SEO | FCP | LCP | TBT | CLS | Weight |
|---|---|---|---|---|---|---|---|---|---|---|
| `/` run 1 | mobile | 73 | 100 | 100 | 100 | 1.4 s | 3.4 s | 780 ms | 0 | 3.9 MB |
| `/` run 2 | mobile | 88 | 100 | 100 | 100 | 1.1 s | 3.1 s | 260 ms | 0 | 3.9 MB |
| `/` | desktop | 100 | 100 | 100 | 100 | 0.3 s | 0.7 s | 10 ms | 0 | 3.9 MB |
| `/learn/bowel-health/bristol-stool-scale` | mobile | 91 | 100 | 100 | 100 | 1.0 s | 2.8 s | 260 ms | 0 | 585 KB |
| `/app/poop-tracker` | mobile | 82 | 100 | 100 | 100 | 1.1 s | 4.1 s | 250 ms | 0 | 801 KB |
| `/explore/bristol-stool-chart` | mobile | 89 | 100 | 100 | 100 | 1.0 s | 3.1 s | 240 ms | 0 | 765 KB |

For comparison, the Oct 19 home mobile runs scored Perf 32–51, LCP 22.5–23.5 s, ~490 requests and 6.3–7.7 MB. These are lab numbers from one location. **Field Core Web Vitals (CrUX) were not available**, and the origin likely has too little traffic to qualify.

## 6. What was not verified

Google's index and selected canonicals (no GSC access) · whether a provider token exists in App Store Connect · the PostHog event schema beyond the homepage bundle · real-device Smart App Banner behavior · Vercel Firewall/bot rules for real crawler IPs · whether the 403s on publisher links (JAMA, Wiley, CDC, Mayo) affect real users (they are bot-blocking responses to our fetcher) · medical accuracy of the 85 articles beyond citation existence. Each PMID was checked to exist and to match the topic, not that it supports the specific sentence.
