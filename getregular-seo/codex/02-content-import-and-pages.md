# Codex spec 02: import the blog drafts and build the new pages

Prerequisite: spec 01, tasks T1–T7 (canonical host, robots, sitemap registry, metadata, AppStoreLink, MDX blog at `/blog/[slug]`, JSON-LD). Read `seo/STRATEGY.md` §4 for the URL map.

## C1. Accept YAML frontmatter in the blog loader

The drafts in `seo/blogs/<cluster>/*.md` use YAML frontmatter (schema: `seo/blogs/_EDITORIAL_STANDARD.md` §3), but spec 01 T6 used `export const meta`. Support both, and don't hand-convert 80 files.

```bash
npm i gray-matter
```

- Add `content/blog/*.md` support to the loader using `gray-matter`, and render the body with `next-mdx-remote/rsc` (`compileMDX` with `remark-gfm`). Keep `@next/mdx` for existing `.mdx` files.
- Map the frontmatter to `PostMeta`:

| YAML | PostMeta | Rule |
|---|---|---|
| `title`, `description`, `slug` | same | `slug` must equal the filename |
| `date_published` / `date_updated` | `datePublished` / `dateModified` | Set at publish. `null` → not routable in production |
| `author` | `authorId` | Only an id from `lib/content/people.ts`. A free-text name → Organization author |
| `medical_reviewer` | `reviewerId` | `"PENDING"` → null |
| `review_status` | `draft` | `draft = review_status !== 'approved'` |
| `sources[]` | `sources` | title + url |
| `internal_links[]` | `related` | |
| `cluster`, `pillar`, `product_page`, `cta_variant`, `primary_keyword`, `feature_dependencies` | new optional fields | `cta_variant` becomes the App Store `ct=` token, e.g. `blog-<cta_variant>` |

- **Publish gate:**
  - In production, a post is routed and listed in the sitemap only if `review_status === 'approved'`, `date_published <= today`, `reviewerId` resolves to a consenting person, and `feature_dependencies` is empty or each item is marked confirmed in `seo/research/product-fact-sheet.md`.
  - Preview deployments may render drafts, with `<meta name="robots" content="noindex">` and a visible "DRAFT – needs medical review" banner.
- The `> **Quick answer:** …` blockquote renders as a styled answer box, using a custom `blockquote` component when its first child starts with "Quick answer".
- Image placeholders `![alt](/images/blog/<slug>/<name>.webp "IMAGE BRIEF: …")`: if the file is missing, render nothing and log a build warning. Never ship a broken image.
- Strip the trailing `<!-- WRITER NOTES … -->` comment from the rendered output. Keep it in the source.

**Acceptance:** `npm run build` passes. `curl -s $PREVIEW/blog/how-to-track-bowel-movements | grep -c 'noindex'` returns 1 while the post is a draft. A post that has been approved appears in `/sitemap.xml`.

## C2. Copy the drafts in

```bash
mkdir -p content/blog
for f in seo/blogs/*/*.md; do case "$(basename "$f")" in _*) continue;; esac; cp "$f" content/blog/; done
```

Don't edit wording during import. Content changes go through the editor and reviewer, and are then re-copied from `seo/blogs/`.

## C3. Internal link validator (CI)

Add `scripts/check-internal-links.ts` and run it in CI:

- For every `content/blog/*.{md,mdx}`, collect `href`s starting with `/`.
- Each must resolve to an existing route: `/`, `/app`, `/how-ai-works`, product pages, `/resources/*`, or `/blog/<slug>` where that slug exists **and** is publishable in the current environment.
- In production builds, a link to an unpublished post must render as plain text, not a 404 link. Implement this in the MDX `a` component: if the target post isn't published, return `<span>{children}</span>`.
- Fail CI on links to unknown routes.

## C4. New page templates

All of these are server-rendered, use existing brand fonts and colors, and route every CTA through `AppStoreLink` with the `ct` token shown. Copy for each page is in `seo/onpage/<file>.md`. Render it as written; wording changes need owner approval.

| Route | Template | Copy file | `ct` | JSON-LD |
|---|---|---|---|---|
| `/` (updates only) | existing homepage | `onpage/homepage.md` | `home-hero`, `home-footer` | Organization, WebSite, MobileApplication |
| `/app` | Facts page (plain text, tables, no animation) | `onpage/app-facts.md` | `app-facts` | MobileApplication (with `@id` from T7), WebPage |
| `/how-ai-works` | Long-form trust page | `onpage/how-ai-works.md` | `how-ai-works` | WebPage + `reviewedBy` only if genuinely reviewed |
| `/poop-tracker` | Product page: hero, how it works (3 steps with real screenshots), sample week, FAQ, related reading | `onpage/poop-tracker.md` | `poop-tracker` | WebPage + BreadcrumbList; reference the MobileApplication `@id` |
| `/food-symptom-tracker` | Product page | `onpage/food-symptom-tracker.md` | `food-symptom-tracker` | same |
| `/ibs-tracker` | Product page | `onpage/ibs-tracker.md` | `ibs-tracker` | same |
| `/resources/bristol-stool-chart` | Resource: interactive type picker (works without JS as a static table), printable PDF link | `onpage/resources-bristol-stool-chart.md` | `bristol-chart` | WebPage + BreadcrumbList |
| `/resources/food-symptom-diary` | Resource + printable | `onpage/resources-food-symptom-diary.md` | `food-diary` | same |
| `/resources/ibs-food-diary` | Resource + printable + worked week | `onpage/resources-ibs-food-diary.md` | `ibs-diary` | same |
| `/resources/bloating-after-eating` | Hub | `onpage/resources-bloating-after-eating.md` | `bloating-hub` | same |
| `/resources/constipation-diary` | Resource + printable | `onpage/resources-constipation-diary.md` | `constipation-diary` | same |
| `/resources/food-diary-for-diarrhea` | Resource + printable | `onpage/resources-food-diary-for-diarrhea.md` | `diarrhea-diary` | same |
| `/resources/gastroenterologist-appointment-prep` | Checklist | `onpage/resources-gi-appointment-prep.md` | `gi-prep` | same |

**Printables:**
- Generate them as static PDFs at build time from one React component per diary, using `@react-pdf/renderer` or a print stylesheet + Playwright PDF in a script. Save them to `public/resources/*.pdf`.
- Link them with `<a href download>`. They need no signup.
- Each PDF carries the page URL and a "not medical advice" footer.

**Navigation:**
- Header: How it works · Trackers (Poop · Food & symptoms · IBS) · Resources · Journal · Download.
- Footer: all resources, `/app`, `/how-ai-works`, legal.
- Every new page needs at least 3 internal links pointing to it on the day it ships.

## C5. Ship order (one PR each, all PR-for-review)

1. Spec 01 P0/P1 fixes (T10, T1, T3, T2, T4, T14).
2. `/app` + `/how-ai-works` + homepage copy updates (after the owner approves claims).
3. `/poop-tracker` + `/resources/bristol-stool-chart` + C1 posts as they're approved.
4. `/food-symptom-tracker` + `/resources/food-symptom-diary` + C2 posts.
5. `/resources/ibs-food-diary` + `/ibs-tracker` + C3 posts.
6. C5 → C4 → C6 → C8 pillars and posts as review clears.
7. C7 comparisons last, after the team adds hands-on test notes.

Each PR body must include `curl -sI` status, canonical, robots meta and `<h1>` for every new URL, plus a Lighthouse mobile run for one page per template.
