# Get Regular: next-steps playbook (26 Oct 2026)

How to carry out the fixes from `../AUDIT.md`. Code in this folder is drop-in: copy it into the site repo and adjust import paths.

| File | What it is |
|---|---|
| `posthog-before-send.ts` | Replacement PostHog sanitizer: auto-generated page allowlist, keeps campaign UTMs, cleans `$set_once` |
| `eeat/people.ts` | People registry for authors, editors and medical reviewers (placeholders that fail the build until replaced) |
| `eeat/article-meta.ts` | Article front-matter type, Article + MedicalWebPage JSON-LD, ProfilePage JSON-LD, byline data, sitemap `lastmod` |
| `eeat/Byline.tsx` | Server-rendered byline: written by, reviewed by + date, published, updated, link to editorial policy |

---

## 1. Submit the sitemap

**Sitemap URL:** `https://www.getregular.com/sitemap.xml` (112 URLs, already referenced in `robots.txt`).

**Google Search Console**
1. Open https://search.google.com/search-console and select the **Domain property** `getregular.com`. If you aren't verified yet, verify through a DNS TXT record at the domain registrar. The 14 Oct check showed this property as unverified for our account.
2. Left menu → **Indexing → Sitemaps** → under "Add a new sitemap" type `sitemap.xml` → **Submit**.
3. Status should read "Success" with 112 discovered URLs. Recheck **Indexing → Pages** weekly and track how many are indexed.

**Bing Webmaster Tools** (Bing also feeds Copilot and several AI answer engines)
1. https://www.bing.com/webmasters → **Import from Google Search Console**. This copies the verified site and sitemap in one step. Otherwise add the site manually and submit the same sitemap URL under **Sitemaps**.
2. Optional: turn on **IndexNow** so every new weekly article reaches Bing on publish (see §2).

## 2. Request indexing

Google: a sitemap gets URLs discovered, and **Request indexing** pushes priority pages up the queue. There is an undisclosed daily quota per property, so don't submit all 112. Let the sitemap handle the long tail.

1. In Search Console, paste a full URL into the top **"Inspect any URL"** bar.
2. Click **Test live URL** and confirm "URL is available to Google".
3. Click **Request indexing**. Done when it says "Indexing requested". It usually takes a day or more, and a request doesn't guarantee indexing.

**Priority order (≈10 a day until the quota stops you):**

| Day | URLs |
|---|---|
| 1 | `/` (replaces the stale "Clinically Validated" snippet), `/app`, `/learn`, `/faq`, `/about`, `/science`, `/explore`, `/app/poop-tracker`, `/app/food-symptom-tracker`, `/learn/bowel-health/bristol-stool-scale` |
| 2 | The 6 cluster hubs (`/learn/gut-health`, `/food-and-digestion`, `/bowel-health`, `/symptoms`, `/tracking`, `/doctor-prep`), `/explore/bristol-stool-chart`, `/explore/why-am-i-bloated`, `/app/gut-check-ai`, `/app/doctor-report` |
| 3+ | Your highest-intent articles (e.g. `best-poop-tracker-apps`, `best-ibs-apps`, `best-food-symptom-tracker-apps`, `poop-color-chart`, `how-often-should-you-poop`, `why-am-i-so-bloated`) |
| Weekly | Each new article on the day it goes live |

**Bing / IndexNow (optional, 15 min):** generate a key in Bing Webmaster Tools (IndexNow section), serve it at `https://www.getregular.com/<key>.txt`, then on each publish:
```sh
curl -X POST https://api.indexnow.org/indexnow -H 'Content-Type: application/json' -d '{
  "host": "www.getregular.com", "key": "<key>", "keyLocation": "https://www.getregular.com/<key>.txt",
  "urlList": ["https://www.getregular.com/learn/<cluster>/<new-article>"] }'
```

## 3. Change the apex redirect from 307 to 308

Today `https://getregular.com/*` answers **307 Temporary** to www. Vercel lets you choose the domain-redirect status code ([changelog](https://vercel.com/changelog/domains-can-now-be-redirected-with-a-custom-status-code)).

1. Vercel → the getregular project → **Settings → Domains**.
2. On the row **`getregular.com`** (the apex, not www), click **Edit**.
3. Leave **Redirect to** = `www.getregular.com`. Set the **status code** to **308 Permanent Redirect** and **Save**.
4. Verify:
   ```sh
   curl -sI https://getregular.com/learn | grep -iE '^(HTTP|location)'
   # expect: HTTP/2 308  and  location: https://www.getregular.com/learn
   ```
   `http://getregular.com/` will still take 2 hops (308 to https, then 308 to www). That's acceptable once both are permanent.

## 4. PostHog: what's actually wrong and the fix

**Correction to the first audit write-up:** PostHog **does** see every current page by path. The live filter is called with a hardcoded allowlist of all 115 routes (tested in `../scripts/ph_fn.js`). The real gaps:

1. **UTMs and click IDs are deleted** from event properties, so you can't split traffic by campaign (TikTok vs. creator vs. newsletter).
2. **The allowlist is typed by hand.** Each new weekly article reports as `/not-found` until a developer adds it.
3. **`$set_once` skips the filter**, so `$initial_current_url` keeps its full query string and `$initial_utm_source` survives there while being stripped from events. That's inconsistent in both directions.

**Fix** (`posthog-before-send.ts`, tested):
- Build the allowlist from the same registry as `app/sitemap.ts`, so a new article is tracked the day it ships. Wiring is in the file's footer comment.
- Keep `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`. Still drop `utm_term` (search terms can name a condition) and all click IDs.
- Apply the same filter to `$set` and `$set_once`.
- Get legal sign-off on the kept-UTM list before shipping. These are campaign labels, but they become part of the health-adjacent browsing record.

**Verify after deploy:** open `https://www.getregular.com/learn?utm_source=test&utm_campaign=audit&fbclid=x`, then in PostHog → Activity find the `$pageview`. Expect `utm_source=test`, `utm_campaign=audit`, no `fbclid`, and `$current_url` without a query string.

**Use the UTMs consistently.** `utm_source` = platform (`tiktok`, `instagram`, `newsletter`, `creator_<handle>`), `utm_medium` = `paid_social` / `organic_social` / `email` / `creator`, `utm_campaign` = the same name you use as the App Store `ct` token. Then PostHog `app_store_click` by `utm_campaign` lines up with App Store Connect downloads by `ct`.

## 5. Weekly publishing from here on

Publishing the backlog in one push is fine. Google doesn't penalize a launch date, and the articles are substantive and sourced. What matters now is that the dates stay true and each new article arrives fully wired. For every new article:

- [ ] `publishedAt` = the real go-live date, **with a timezone offset** (`2026-11-03T09:00:00-05:00`). Never backdate to fill missed weeks.
- [ ] Byline names a real author/editor (§6). Reviewer line only if a clinician actually reviewed it.
- [ ] Article image (16:9, 1200×675 or larger), used for `og:image` and Article `image`.
- [ ] 3+ internal links **to** it from its hub and 2 sibling articles (13 launch articles have ≤2 today).
- [ ] Sources pass the validator: links resolve, no retracted PubMed IDs. Add `esummary` retraction checks to `validate_blogs.py`.
- [ ] Appears in `sitemap.xml` with `lastmod`, and in the PostHog allowlist automatically (§4).
- [ ] Request indexing in Search Console + IndexNow ping on publish day.

When you **edit** an existing article's substance (facts, advice, sources), set `updatedAt`. It drives the visible "Updated" line, `dateModified` and sitemap `lastmod`. Don't bump it for typos or design changes.

## 6. Building the E-E-A-T layer

Health content is "Your Money or Your Life" territory. Google's guidance on helpful, people-first content asks **who** created it, **how** (sources, review, AI use) and **why** (to help people rather than to rank) ([Google Search Central](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)). The articles already answer *how* well. The gaps are *who* and the proof of review. Build it in this order:

**Step 1: People (week 1)**
1. Pick a real **editor**: the person accountable for the library, e.g. a founder or content lead. They should actually edit or approve each piece.
2. Decide on **medical review.** Ask Dr. Schopis whether he'll review articles. Today the site says advisory review is *not* medical review of every article, so either he takes on that role in writing, or you contract a reviewer (a GI physician or a registered dietitian for the food clusters). Agree on scope, turnaround and a fee, and record the fee as a disclosure.
3. Fill `eeat/people.ts`. The build throws while any `REPLACE` placeholder remains, so nobody can ship a fake byline.

**Step 2: Profile pages (week 1–2)**
- `/about/team/<slug>` for each person: photo, role at Get Regular, training, credentials with a verify link (NPI registry for US physicians, licence or board lookup for others), affiliations, `sameAs` links (LinkedIn, Doximity, practice page), the relationship and compensation disclosure, and the articles they wrote or reviewed.
- Markup: `profilePageJsonLd()` (ProfilePage + Person).

**Step 3: Bylines and markup on articles (week 2)**
- Swap the "Get Regular Editorial Team" line for `<Byline>`: *Drafted with AI assistance, edited by [Editor] · Medically reviewed by [Reviewer] on [date] · Published · Updated · How we write and review*. The AI disclosure matches the editorial policy you already publish.
- Swap the article JSON-LD for `articleJsonLd()`. Author becomes a Person with a profile URL, it adds `dateModified`, `image` and timezone-qualified dates, and it adds `reviewedBy`/`lastReviewed` on a `MedicalWebPage` **only when a review happened**. Markup must match the visible byline exactly.

**Step 4: Review the riskiest articles first (weeks 2–6)**
Start with pages where wrong advice could delay care:
`when-to-see-doctor-bowel-changes`, `mucus-in-stool`, `poop-color-chart`, `green-poop`, `yellow-diarrhea`, `havent-pooped-in-days`, `constipation-then-diarrhea`, `diarrhea-after-eating`, `urgent-bowel-movement-morning`, `how-is-ibs-diagnosed`, `can-ibs-start-suddenly`, `glp1-diarrhea-tracking`, `can-constipation-cause-back-pain`, `can-constipation-cause-nausea`, `how-to-describe-abdominal-pain`, `bristol-stool-scale`.
Have the reviewer fix the retracted-citation pages (`dairy-bloating`, `coffee-and-bloating`) in the same pass. After that, review ~5 articles a week alongside the new ones.

**Step 5: Company trust pages (week 2–3)**
- `/about`: founder(s) with names and photos, why the company exists, the team, legal entity, address, contact and support routes, funding or backers if public, and links to profile pages. The same first-person rewrite you're doing on the product pages applies here.
- `/science/editorial-policy`: add the review workflow (who, what's checked, how often re-reviewed), the AI-assistance process, a **corrections log** with dated entries, and how readers report an error.
- `/science/clinical-review`: state plainly what the advisor did and does, with dates.

**Step 6: Keep it true over time**
- Re-review medical articles every 12 months or when a guideline changes (e.g. Rome V). Bump `reviewedAt`, and bump `updatedAt` only if content changed.
- Quarterly: rerun the link and retraction validator, and check that every name in a byline still has a live profile.

**What this does and doesn't do:** none of these are ranking switches, and `reviewedBy` has no Google rich result. They make the site's real expertise legible to readers, raters and AI answer engines, and they protect the brand on a health topic. The worst outcome would be fake or unearned bylines, which is why the registry refuses placeholders and the reviewer line depends on a dated review record.
