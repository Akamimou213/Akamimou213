# getregular.com: technical fixes and drop-in files

I audited the live site on 2026-10-23, before the pending SEO deploy. Re-check each item after that deploy ships, since some may already be fixed.

## Fix list, in priority order

| # | Issue found on the live site | Fix | Why it matters |
|---|---|---|---|
| 1 | `getregular.com` returns a **307 (temporary)** redirect to `www.getregular.com`, but every canonical, sitemap URL and og:image points to the apex `getregular.com` | Pick one host. Since the canonicals already use the apex, set `getregular.com` as the primary domain in Vercel and redirect `www` → apex with a **308**. Otherwise switch every canonical and sitemap URL to `www`. | Canonical URLs that redirect send mixed signals, and crawlers waste requests on redirects |
| 2 | `/robots.txt` returns 404 | Ship `robots.txt` (in this folder) or `app/robots.ts` | Lets you state AI-crawler access explicitly and declare the sitemap |
| 3 | No canonical tag on `/` or `/blog` | Add a self-referencing canonical to every indexable page (`alternates.canonical` in Next.js metadata) | |
| 4 | No Organization or MobileApplication schema; articles credit "Get Regular Team" as an Organization with no reviewer | See `structured-data.md`. Add a named author plus "Medically reviewed by Michael Schopis, MD", shown on the page as well | Trust signal for YMYL health content. Expect no AI-citation lift from schema alone |
| 5 | The site's App Store links point to the `/ca/` storefront | Use `https://apps.apple.com/us/app/get-regular-ai-gut-health/id6749188690` | US is the main market; the `/us/` page is the one AI answers cite |
| 6 | Hero says "Clinically Validated" | Link it to evidence (a study, protocol or summary on `/about/medical-review`), or change it to "Built with a board-certified gastroenterologist" | An unsupported health claim is an FTC substantiation risk. It is also contradictory if the App Store medical-device declaration says "No". AI answers will repeat whatever the evidence supports |
| 7 | The only article is about 395 words; competing Bristol-chart pages are hubs with one page per type | Expand it into the hub described in the roadmap and move it to `/blog/bristol-stool-chart` (301 from the old slug) | The intent the page targets is "bristol stool chart" |
| 8 | Footer says © 2025 | Use the current year | Small freshness and trust signal |
| 9 | No `/llms.txt` and no AI info page | Ship `llms.txt` (in this folder), and publish the same facts as a normal HTML page at `/about/ai-info` | Google ignores llms.txt, so the HTML page is what crawlers actually read |
| 10 | Not verified in Bing | Add the site to Bing Webmaster Tools, submit the sitemap and enable IndexNow | Bing powers Copilot and several downstream search products. Setup is free and takes about 10 minutes |
| 11 | Google Search Console | Submit the sitemap. Leave the "Search generative AI" control set to **Include** | Excluding the site removes it from AI Overviews and AI Mode |

## Files in this folder
- `robots.txt`: allows search and AI crawlers and declares the sitemap. Training crawlers (GPTBot, ClaudeBot, Google-Extended) are allowed. Blocking them is a legal or brand decision and doesn't affect Google ranking.
- `llms.txt`: a plain fact sheet. Only list a page under "Key pages" once that page is live.
- `structured-data.md`: JSON-LD for Organization, MobileApplication, Person (reviewer), MedicalWebPage and BlogPosting.
