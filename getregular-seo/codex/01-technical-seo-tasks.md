# Codex spec 01: technical SEO for getregular.com (Next.js)

**For:** the engineer or agent implementing changes in the private repo `avandame/getregular-landing`.
**Source of findings:** `getregular-seo/technical/technical-audit.md` (live checks on 19 Oct 2026). Finding IDs (F01…) refer to that file.
**Assumed stack:** Vercel with the Next.js **App Router**. That much is confirmed by RSC `vary` headers and `self.__next_f`. The version is probably **16.x**: `version:"16.2.1"` appears in a client chunk, but this is unverified. The code below uses the async `params` signature (`params: Promise<…>`), which works on 15 and 16. Pages Router fallbacks are at the end of each task.

## Ground rules (read before coding)

1. **Inspect first.** Run `cat package.json`, `ls app`, `grep -rn "metadataBase\|sitemap\|posthog\|apps.apple.com\|opacity: 0\|initial={{" app components lib src 2>/dev/null`. The live site already has a sitemap route, a blog (`/blog`, `/blog/[slug]`), a PostHog snippet, and an `app_store_click` event with `location` values `nav | mobile_nav | sticky_cta`. **Modify those; do not duplicate them.** If blog posts are stored as TS objects rather than MDX, keep that storage and implement the `PostMeta` registry interface in T6 over it. Do not migrate content unless asked.
2. Keep the visual design, copy (except T15, which needs approval), fonts, colors, and CTA behavior.
3. **Never invent facts.** That means no ratings, review counts, prices, people, credentials, dates or statistics. Every fact in metadata or JSON-LD must match visible page content or a verified source listed in `lib/site.ts`.
4. Use one shared site config (T1). Do not hard-code the origin anywhere else.
5. After each task, run its **Verify** command against a Vercel preview, using `BASE=https://<preview-url>`. After production deploy, run it with `BASE=https://www.getregular.com`. `scripts/seo_check.py` (T21) runs all of them.

**Order:** T1 → T2 → T3 → T4 → T9 → T10 → T12 → T11 → T13 → T14 → T7 → T6 → T8 → T16 → T17 → T18 → T19. T15 and T20 are owner tasks, not Codex tasks.

---

## T1: One canonical origin (`www`) and a permanent apex redirect [P0, F02, F21]

**Problem.** `metadataBase` currently resolves to `https://getregular.com`, so canonicals, sitemap `<loc>` and og:image all use the apex host. But the apex host **307s** to www.

**Do:**
1. Create `lib/site.ts`:

```ts
// lib/site.ts — single source of truth for origin + verified product facts
export const SITE_URL = 'https://www.getregular.com' as const;
export const SITE_NAME = 'Get Regular';
export const LEGAL_NAME = 'Get Regular Health, Inc.'; // footer + App Store seller (verified 2026-10-19)
export const CONTACT_EMAIL = 'hello@getregular.com';

export const APP = {
  appStoreId: '6749188690',
  bundleId: 'com.getregular.app',
  name: 'Get Regular: AI Gut Health', // App Store trackName, verified via iTunes Lookup 2026-10-19
  minimumOs: 'iOS 15.1',              // iTunes Lookup minimumOsVersion 15.1
  canonicalStoreUrl: 'https://apps.apple.com/us/app/get-regular-ai-gut-health/id6749188690',
  // Download price observed as 0.0 USD ("Free") via iTunes Lookup 2026-10-19; app sells auto-renewing
  // subscriptions (see /legal/terms-of-service). Owner must confirm before relying on it. Set to null to omit.
  downloadOffer: { price: '0', priceCurrency: 'USD', verifiedAt: '2026-10-19' } as
    | { price: string; priceCurrency: string; verifiedAt: string }
    | null,
} as const;

export const SOCIAL = {
  tiktok: 'https://www.tiktok.com/@getregular',
  instagram: 'https://www.instagram.com/get.regular',
  linkedin: 'https://www.linkedin.com/company/get-regular/',
} as const;

export const absoluteUrl = (path = '/') => new URL(path, SITE_URL).toString();
export const isProduction = process.env.VERCEL_ENV
  ? process.env.VERCEL_ENV === 'production'
  : process.env.NODE_ENV === 'production';
```

2. In `app/layout.tsx`, set `metadataBase: new URL(SITE_URL)`. Replace every existing `https://getregular.com` literal: `grep -rn "https://getregular.com" .` must return only comments.
3. **Vercel dashboard (owner or whoever has access):** go to Project → Settings → Domains. `www.getregular.com` stays the production domain. Edit `getregular.com` to **Redirect to `www.getregular.com`** and set the status code to **308 Permanent Redirect**. It is currently 307.
4. Code fallback, used only if the dashboard cannot be changed. Domain-level redirects run before the app, so this rule never fires while the 307 exists. Add it to `next.config.ts` → `redirects()`:

```ts
{ source: '/:path*', has: [{ type: 'host', value: 'getregular.com' }], destination: 'https://www.getregular.com/:path*', permanent: true },
```

**Acceptance criteria**
- `https://getregular.com/<any>` returns **308** (or 301) to the same path on www, in one hop.
- No `getregular.com` apex URL appears in any HTML, sitemap, or JSON-LD.

**Verify**
```bash
curl -sI https://getregular.com/blog | grep -iE '^HTTP|^location'          # HTTP/2 308, location: https://www.getregular.com/blog
curl -s https://www.getregular.com/ https://www.getregular.com/sitemap.xml | grep -oE 'https://getregular\.com[^"< ]*' | wc -l   # 0
```

---

## T2: `app/sitemap.ts` generated from a content registry [P1, F10]

**Problem.** The current sitemap uses apex URLs, a future `lastmod` (`2026-10-20`), no lastmod on most pages, and `priority`/`changefreq` (Google ignores both).

**Do:**
1. Create `lib/content/routes.ts`. This is the registry of non-collection pages. Add each new indexable page here when it ships.

```ts
// lib/content/routes.ts
export type StaticRoute = {
  path: `/${string}`;
  lastModified: string | 'from-posts'; // ISO date of the last *meaningful content* change (update by hand when copy changes), or 'from-posts' = newest post date
  indexable: boolean;
};

export const STATIC_ROUTES: StaticRoute[] = [
  { path: '/',                        lastModified: '2026-10-19', indexable: true }, // set to real last homepage copy change
  { path: '/blog',                    lastModified: 'from-posts', indexable: true },
  { path: '/legal/privacy-policy',    lastModified: '2026-06-08', indexable: true }, // "Last update — June 8, 2026"
  { path: '/legal/terms-of-service',  lastModified: '2026-08-04', indexable: true }, // "Last update — August 4, 2026"
];
```

2. Replace the existing sitemap route with `app/sitemap.ts`. First delete any other sitemap implementation (`app/sitemap.xml/route.ts`, `public/sitemap.xml`, `next-sitemap` config).

```ts
// app/sitemap.ts
import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site';
import { STATIC_ROUTES } from '@/lib/content/routes';
import { getAllPosts } from '@/lib/content/posts';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts(); // published only, never future-dated (see T6)
  const newestPost = posts[0]?.dateModified ?? posts[0]?.datePublished;

  const pages = STATIC_ROUTES.filter((r) => r.indexable).map((r) => ({
    url: absoluteUrl(r.path),
    lastModified: r.lastModified === 'from-posts' ? newestPost : r.lastModified,
  }));

  const articles = posts.map((p) => ({
    url: absoluteUrl(`/blog/${p.slug}`),
    lastModified: p.dateModified ?? p.datePublished,
  }));

  return [...pages, ...articles].filter((e) => e.lastModified !== undefined);
}
```

**Acceptance criteria**
- `/sitemap.xml` is 200 `application/xml`.
- Every `<loc>` starts with `https://www.getregular.com`, returns **200 without redirect**, and has a self-canonical.
- Every entry has `<lastmod>`, and none is later than today.
- No `<priority>` or `<changefreq>`.
- No draft, 404, noindex, `/invite/*` or legal-duplicate URLs.

**Verify**
```bash
BASE=https://www.getregular.com
curl -s $BASE/sitemap.xml | grep -oE '<loc>[^<]+' | sed 's/<loc>//' | while read u; do printf '%s ' "$u"; curl -s -o /dev/null -w '%{http_code}\n' "$u"; done   # every line 200
curl -s $BASE/sitemap.xml | grep -cE '<priority>|<changefreq>'   # 0
curl -s $BASE/sitemap.xml | grep -oE '<lastmod>[^<]+' | sed 's/<lastmod>//' | awk -v t="$(date -u +%F)" '$0>t{print "FUTURE",$0}'   # no output
```

*Pages Router fallback:* `pages/sitemap.xml.ts` with `getServerSideProps` writes XML to `res` with `Content-Type: application/xml` and `Cache-Control: s-maxage=3600`, then returns `{ props: {} }`.

---

## T3: `app/robots.ts` with a documented crawler policy [P1, F09, F28]

### Policy

| Group | Agents | Default | Why |
|---|---|---|---|
| Search and user-initiated retrieval | `Googlebot`, `Bingbot`, `OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `Perplexity-User`, `Claude-SearchBot`, `Claude-User`, `Applebot`, `DuckDuckBot` | **Allow** | Required for search and AI-answer visibility. Blocking any of these removes Get Regular from that surface. |
| Model-training crawlers | `GPTBot`, `ClaudeBot`, `Google-Extended`, `Applebot-Extended`, `CCBot`, `meta-externalagent` | **Business decision. Recommended default: Allow** | The public site is marketing copy and education, with no user data. Allowing training raises the chance that models know the brand and its category. The cost is reuse of copy without attribution. Blocking these does **not** affect Google Search or AI Overviews (`Google-Extended` is a training/grounding control for Gemini, not a Search crawler), and it does not affect ChatGPT search (`OAI-SearchBot` is separate from `GPTBot`). Flip `ROBOTS_ALLOW_AI_TRAINING=false` to opt out, then redeploy. |
| Everything else (`*`) | n/a | Allow | n/a |

Disallow only non-content paths: `/api/` and `/invite/` (the latter only redirects to the App Store). **robots.txt is not access control.** Private data must stay behind auth. Non-production deployments must disallow everything.

> Note: a crawler that matches a named group ignores the `*` group. That is why the `disallow` list is repeated in every group.

```ts
// app/robots.ts
import type { MetadataRoute } from 'next';
import { SITE_URL, isProduction } from '@/lib/site';

const SEARCH_AND_USER_AGENTS = [
  'Googlebot', 'Bingbot', 'OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'Perplexity-User',
  'Claude-SearchBot', 'Claude-User', 'Applebot', 'DuckDuckBot',
];
const TRAINING_AGENTS = ['GPTBot', 'ClaudeBot', 'Google-Extended', 'Applebot-Extended', 'CCBot', 'meta-externalagent'];

// Business decision (see technical/technical-audit.md + this spec T3). Default: allow.
const ALLOW_AI_TRAINING = process.env.ROBOTS_ALLOW_AI_TRAINING !== 'false';
const DISALLOW = ['/api/', '/invite/'];

export default function robots(): MetadataRoute.Robots {
  if (!isProduction) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }
  return {
    rules: [
      { userAgent: SEARCH_AND_USER_AGENTS, allow: '/', disallow: DISALLOW },
      ALLOW_AI_TRAINING
        ? { userAgent: TRAINING_AGENTS, allow: '/', disallow: DISALLOW }
        : { userAgent: TRAINING_AGENTS, disallow: '/' },
      { userAgent: '*', allow: '/', disallow: DISALLOW },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
```

**Acceptance criteria**
- `/robots.txt` is 200 `text/plain`.
- It contains `Sitemap: https://www.getregular.com/sitemap.xml`.
- No search agent is disallowed from `/`.
- A preview deployment returns `Disallow: /` for `*`.

**Verify**
```bash
curl -s -D- https://www.getregular.com/robots.txt | grep -iE '^HTTP|content-type|^sitemap|^user-agent|^disallow'
curl -s https://www.getregular.com/robots.txt | awk '/User-Agent: (Googlebot|OAI-SearchBot)/,/^$/' | grep -c 'Disallow: /$'   # 0
```
After deploy, use the robots.txt report in Google Search Console and the Bing Webmaster robots tester.

*Pages Router fallback:* `public/robots.txt` (a static file with the same content), or `pages/robots.txt.ts` if the env-driven policy is needed.

---

## T4: Per-route metadata (title, description, canonical, OG, Twitter) [P1, F03, F13, F14]

1. Create `lib/seo.ts`:

```ts
// lib/seo.ts
import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/site';

type Args = {
  title: string;               // page title WITHOUT brand suffix (template adds it) unless absoluteTitle
  absoluteTitle?: boolean;
  description: string;         // 120–160 chars, unique per page
  path: `/${string}`;          // canonical path, no query, no trailing slash (except '/')
  image?: { url: string; width: number; height: number; alt: string };
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  noindex?: boolean;
};

const DEFAULT_OG = { url: '/images/og/default.jpg', width: 1200, height: 630, alt: 'Get Regular — AI gut health tracking app for iPhone' };

export function buildMetadata(a: Args): Metadata {
  const image = a.image ?? DEFAULT_OG;
  return {
    title: a.absoluteTitle ? { absolute: a.title } : a.title,
    description: a.description,
    alternates: { canonical: a.path },
    openGraph: {
      type: a.type ?? 'website',
      url: a.path,
      siteName: SITE_NAME,
      locale: 'en_US',
      title: a.title,
      description: a.description,
      images: [image],
      ...(a.type === 'article'
        ? { publishedTime: a.publishedTime, modifiedTime: a.modifiedTime, authors: a.authors }
        : {}),
    },
    twitter: { card: 'summary_large_image', title: a.title, description: a.description, images: [image.url] },
    ...(a.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
```

> Next merges `openGraph` and `twitter` **shallowly**: a child route's `openGraph` replaces the parent's entirely. That is why every route must call `buildMetadata` and none should rely on inheritance. Inheritance is the cause of F13, where `/blog` and the legal pages show the homepage OG.

2. Root `app/layout.tsx`:

```ts
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Get Regular', template: '%s — Get Regular' }, // keeps the site's existing "— Get Regular" style
  applicationName: 'Get Regular',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
  itunes: { appId: APP.appStoreId }, // T8
  formatDetection: { telephone: false },
};
```

3. Per-route values. **The homepage title and description are drafts.** They need owner approval and keyword validation (`keywords/` workstream). Keep the brand voice in the H1.

| Route | `title` | `description` (draft) | Notes |
|---|---|---|---|
| `/` | `AI Gut Health App: Track Stool, Meals & Symptoms \| Get Regular` (`absoluteTitle: true`) | `Log bowel movements on the Bristol scale, meals and symptoms in seconds. Get Regular's AI finds your patterns and gives daily gut scores. On iPhone.` | Do not mention "clinically validated" (F01) |
| `/blog` | `The Journal: Gut Health, Digestion & Poop, Explained` | `Plain-language guides to digestion, stool, fiber and the gut, from the Get Regular team.` | Remove "Weekly" unless the cadence is real (F26) |
| `/blog/[slug]` | `post.title` | `post.description` | `type: 'article'`, `publishedTime`, `modifiedTime`, `image: post.image` (T6) |
| `/legal/privacy-policy` | `Privacy Policy` | `How Get Regular collects, uses and protects your information, including meals, stool photos and symptom logs.` | Indexable |
| `/legal/terms-of-service` | `Terms of Service` | `The terms that govern your use of the Get Regular app, subscriptions and website.` | Indexable |

4. Replace `/images/preview.png` (916 KB PNG) with `/public/images/og/default.jpg` at 1200×630, under 200 KB, same artwork.

**Acceptance criteria.** On every route in the sitemap:
- exactly one `<link rel="canonical">`, absolute, on www, equal to the route's own URL, with no query string;
- a unique `<title>` and `<meta name="description">`;
- `og:url` equal to the canonical;
- route-specific `og:title`;
- `og:site_name`.

`/?utm_source=x` must carry the canonical `https://www.getregular.com/`.

**Verify**
```bash
for p in / /blog /blog/what-your-poop-is-trying-to-tell-you /legal/privacy-policy /legal/terms-of-service "/?utm_source=x&gclid=y"; do
  h=$(curl -s "https://www.getregular.com$p"); echo "== $p"
  echo "$h" | grep -oE '<link rel="canonical" href="[^"]+"'
  echo "$h" | grep -oE '<title>[^<]+' ; echo "$h" | grep -oE '<meta property="og:(url|title|site_name)" content="[^"]+"'
done
```

*Pages Router fallback:* a `<Seo>` component that renders `next/head` tags from the same `buildMetadata` inputs. Canonical is `absoluteUrl(router.asPath.split('?')[0])`.

---

## T5: Navigation and footer links [P1, F15]

- Header: keep the section anchors on `/`. On every other route, links must use the full path (`/#how`), not `#how`. Keep the `Blog` link (label `Journal` or `Blog`, either is fine). When the content plan adds pages, add links for: product pages (`/food-symptom-tracker`, `/bowel-movement-tracker`, provisional), `/how-ai-works`, `/about`, and `/faq`. Add a link only once its page exists. **Never link to a 404.**
- Footer: Privacy and Terms must use plain `<a href>` **without** `target="_blank"`. Add links to `/blog`, plus `/about` and `/how-ai-works` once they exist.
- The article template gets a visible breadcrumb (`Home › Journal › {title}`) and a "Related" block (T6).
- All links must be `<Link href>` or `<a href>` elements. No `onClick` navigation.

**Verify:** `curl -s $BASE/blog/what-your-poop-is-trying-to-tell-you | grep -oE 'href="/[^"#]*"' | sort -u` lists `/`, `/blog` and at least one other internal page. `curl -s $BASE/ | grep -c 'target="_blank"[^>]*href="/legal'` returns 0.

---

## T6: Blog at `/blog/[slug]` with MDX and a typed post registry [P1, F11, F12]

**Decision: keep `/blog/[slug]`; do not move to `/learn`.** `/blog` and its first post are already live, already linked from the homepage, and already in the sitemap. They may be discovered by now. Renaming would add a redirect hop, reset discovery, and give no ranking benefit, since URL folder words carry negligible weight. The visible section name stays "The Journal". If the content plan later adds evergreen tools (Bristol chart, diary template), give them a separate `resources` collection at `/resources/[slug]` that uses the same loader. Each URL gets exactly one canonical home.

### 6.1 Setup (@next/mdx, which supports Turbopack)

```bash
npm i @next/mdx @mdx-js/loader @mdx-js/react @types/mdx remark-gfm server-only
```

```ts
// next.config.ts (merge with existing config)
import createMDX from '@next/mdx';
const withMDX = createMDX({ options: { remarkPlugins: ['remark-gfm'] } }); // string form required under Turbopack
const nextConfig = { pageExtensions: ['ts', 'tsx', 'md', 'mdx'], /* …existing… */ };
export default withMDX(nextConfig);
```

```tsx
// mdx-components.tsx (project root — required by @next/mdx in App Router)
import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: ({ href = '', ...p }) =>
      href.startsWith('/') ? <Link href={href} {...p} /> : <a href={href} rel="noopener" target="_blank" {...p} />,
    ...components,
  };
}
```

### 6.2 Content files

`content/blog/what-your-poop-is-trying-to-tell-you.mdx`:

```mdx
export const meta = {
  title: 'What Your Poop Is Trying to Tell You',
  description: 'A friendly guide to the Bristol Stool Scale, the 7-type chart doctors actually use to talk about poop.',
  datePublished: '2026-10-19',      // REAL publish date — live page currently shows 2026-10-20 (future). Owner confirms.
  dateModified: '2026-10-19',
  authorId: null,                   // set to a people.ts id once a real, consenting author exists; null => Organization author
  reviewerId: null,                 // set ONLY when a qualified reviewer actually reviewed this text
  lastReviewed: null,               // ISO date of that review
  image: { url: '/images/blog/bristol-stool-scale.jpg', width: 1200, height: 630, alt: 'The 7 Bristol Stool Scale types' }, // optional; omit if no original image
  sources: [
    { title: 'Lewis SJ, Heaton KW. Stool form scale as a useful guide to intestinal transit time. Scand J Gastroenterol. 1997;32(9):920-4', url: 'https://doi.org/10.3109/00365529709011203' },
  ],
  related: [],                      // slugs or paths of related internal pages
  draft: false,
};

{/* body copy unchanged from the live post */}
```

> Check every source URL before publishing. The DOI above is the commonly cited reference for the Bristol scale, but this audit did **not** fetch it.

### 6.3 People registry (no invented people)

```ts
// lib/content/people.ts
export type Person = {
  id: string; name: string; honorificSuffix?: string; jobTitle: string;
  affiliation?: string[]; bioPath: `/${string}`; sameAs?: string[]; image?: string;
  consentRecorded: boolean;         // written permission to be named as author/reviewer on this site
};
export const PEOPLE: Record<string, Person> = {
  // Example — do NOT set consentRecorded:true until the owner confirms in writing.
  'michael-schopis': {
    id: 'michael-schopis', name: 'Michael Schopis', honorificSuffix: 'MD',
    jobTitle: 'Board-Certified Gastroenterologist; Clinical Advisor, Get Regular',
    affiliation: ['NY Presbyterian', 'Weill Cornell', 'Manhattan Gastroenterology'], // as shown on homepage
    bioPath: '/about#michael-schopis',
    sameAs: [], // add his official profile URL after owner confirms it
    consentRecorded: false,
  },
};
export const getPerson = (id: string | null | undefined) =>
  id && PEOPLE[id]?.consentRecorded ? PEOPLE[id] : null;
```

### 6.4 Loader (`lib/content/posts.ts`)

```ts
import 'server-only';
import fs from 'node:fs';
import path from 'node:path';

export type Source = { title: string; url: string };
export type PostMeta = {
  slug: string; title: string; description: string;
  datePublished: string; dateModified?: string;
  authorId: string | null; reviewerId: string | null; lastReviewed: string | null;
  image?: { url: string; width: number; height: number; alt: string };
  sources: Source[]; related: string[]; draft: boolean;
};

const DIR = path.join(process.cwd(), 'content/blog');
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const today = () => new Date().toISOString().slice(0, 10);

function validate(slug: string, m: any): PostMeta {
  const errs: string[] = [];
  if (!m?.title) errs.push('title');
  if (!m?.description || m.description.length > 170) errs.push('description (<=170 chars)');
  if (!ISO.test(m?.datePublished ?? '')) errs.push('datePublished (YYYY-MM-DD)');
  if (m?.dateModified && (!ISO.test(m.dateModified) || m.dateModified < m.datePublished)) errs.push('dateModified');
  if (m?.reviewerId && !ISO.test(m?.lastReviewed ?? '')) errs.push('lastReviewed required with reviewerId');
  if (errs.length) throw new Error(`Invalid meta in content/blog/${slug}.mdx: ${errs.join(', ')}`);
  return { sources: [], related: [], draft: false, authorId: null, reviewerId: null, lastReviewed: null, ...m, slug };
}

export async function getAllPosts({ includeDrafts = false } = {}): Promise<PostMeta[]> {
  const slugs = fs.readdirSync(DIR).filter((f) => f.endsWith('.mdx')).map((f) => f.replace(/\.mdx$/, ''));
  const posts = await Promise.all(
    slugs.map(async (slug) => validate(slug, (await import(`@/content/blog/${slug}.mdx`)).meta)),
  );
  return posts
    .filter((p) => includeDrafts || (!p.draft && p.datePublished <= today()))   // no drafts, no future dates
    .sort((a, b) => (b.dateModified ?? b.datePublished).localeCompare(a.dateModified ?? a.datePublished));
}

export async function getPost(slug: string) {
  const posts = await getAllPosts();
  const meta = posts.find((p) => p.slug === slug);
  if (!meta) return null;
  const { default: Body } = await import(`@/content/blog/${slug}.mdx`);
  return { meta, Body };
}
```

> Future-dated posts are excluded at build time. For posts to "go live" on their date, the site needs a rebuild that day (Vercel cron → deploy hook) or `export const revalidate = 86400` on `/blog` and `/blog/[slug]`.

### 6.5 Route `app/blog/[slug]/page.tsx`

```tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllPosts, getPost } from '@/lib/content/posts';
import { getPerson } from '@/lib/content/people';
import { buildMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { articleGraph } from '@/lib/schema';
import { AppStoreLink } from '@/components/AppStoreLink';

export const dynamicParams = false;           // unknown slug => real 404
export async function generateStaticParams() {
  return (await getAllPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  const { meta } = post;
  const author = getPerson(meta.authorId);
  return buildMetadata({
    title: meta.title, description: meta.description, path: `/blog/${slug}`, type: 'article',
    publishedTime: meta.datePublished, modifiedTime: meta.dateModified ?? meta.datePublished,
    authors: author ? [author.name] : ['Get Regular'], image: meta.image,
  });
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const { meta, Body } = post;
  const author = getPerson(meta.authorId);
  const reviewer = getPerson(meta.reviewerId);
  const fmt = (d: string) => new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

  return (
    <article>
      <JsonLd data={articleGraph(meta, author, reviewer)} />
      <nav aria-label="Breadcrumb"><ol>
        <li><Link href="/">Home</Link></li><li><Link href="/blog">Journal</Link></li><li aria-current="page">{meta.title}</li>
      </ol></nav>
      <h1>{meta.title}</h1>
      <p>
        By {author ? <Link href={author.bioPath}>{author.name}{author.honorificSuffix ? `, ${author.honorificSuffix}` : ''}</Link> : 'the Get Regular team'}
        {' · '}<time dateTime={meta.datePublished}>{fmt(meta.datePublished)}</time>
        {meta.dateModified && meta.dateModified !== meta.datePublished && <> · Updated <time dateTime={meta.dateModified}>{fmt(meta.dateModified)}</time></>}
      </p>
      {reviewer && meta.lastReviewed && (
        <p>Medically reviewed by <Link href={reviewer.bioPath}>{reviewer.name}, {reviewer.honorificSuffix}</Link> on <time dateTime={meta.lastReviewed}>{fmt(meta.lastReviewed)}</time></p>
      )}
      <Body />
      {meta.sources.length > 0 && (
        <section aria-labelledby="sources"><h2 id="sources">Sources</h2>
          <ol>{meta.sources.map((s) => <li key={s.url}><a href={s.url} rel="noopener" target="_blank">{s.title}</a></li>)}</ol>
        </section>
      )}
      <AppStoreLink location="blog_post_end">Download on the App Store</AppStoreLink>
    </article>
  );
}
```

Keep the existing markup and classes. The snippet shows the required **elements**, not the styling. `/blog/page.tsx` lists `getAllPosts()` and uses `buildMetadata` (T4) plus the breadcrumb JSON-LD (T7).

**Acceptance criteria**
- A slug outside the registry returns **404**.
- No post page shows a date later than today.
- The byline matches JSON-LD `author`.
- A "Medically reviewed by" line appears only when `reviewerId` resolves to a consenting person, and JSON-LD `reviewedBy` then appears too.
- Each post links to `/`, `/blog`, and at least one other internal URL.
- MDX build errors fail CI.

**Verify**
```bash
curl -s -o /dev/null -w '%{http_code}\n' https://www.getregular.com/blog/does-not-exist     # 404
curl -s https://www.getregular.com/blog/what-your-poop-is-trying-to-tell-you | grep -oE 'datetime="[^"]+"'   # no date > today
```

*Pages Router fallback:* `pages/blog/[slug].tsx` with `getStaticPaths` (`fallback: false`) and `getStaticProps` using the same loader (swap the dynamic `import()` for `next-mdx-remote/serialize`).

---

## T7: JSON-LD entity graph [P2, F12, F16]

**Rules**
- Use stable `@id`s: `https://www.getregular.com/#organization`, `#website`, `#app`.
- **No `aggregateRating` or `review`.** Ratings live on Apple, change over time, are not shown on the site, and the count is small (13 US ratings on 19 Oct 2026). The consequence is that the app is **not eligible for Google's software-app rich result**. That is accepted.
- Include `offers` only while `APP.downloadOffer` is non-null (T1).
- Do not add `FAQPage` or `HowTo` for rich-result purposes.
- Every property must match visible content.

```tsx
// components/seo/JsonLd.tsx
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // escape "<" so content can never close the script tag
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
```

```ts
// lib/schema.ts
import { SITE_URL, SITE_NAME, LEGAL_NAME, CONTACT_EMAIL, APP, SOCIAL, absoluteUrl } from '@/lib/site';
import type { PostMeta } from '@/lib/content/posts';
import type { Person } from '@/lib/content/people';

const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;
const APP_ID = `${SITE_URL}/#app`;

export const organization = {
  '@type': 'Organization', '@id': ORG_ID,
  name: SITE_NAME, legalName: LEGAL_NAME, url: `${SITE_URL}/`,
  logo: { '@type': 'ImageObject', url: absoluteUrl('/brand/get-regular-logo-512.png'), width: 512, height: 512 }, // create this square PNG
  email: CONTACT_EMAIL,
  sameAs: [SOCIAL.tiktok, SOCIAL.instagram, SOCIAL.linkedin, APP.canonicalStoreUrl],
};

export const website = {
  '@type': 'WebSite', '@id': SITE_ID, url: `${SITE_URL}/`, name: SITE_NAME,
  inLanguage: 'en-US', publisher: { '@id': ORG_ID },
  // No SearchAction: the site has no search.
};

export const mobileApp = {
  '@type': 'MobileApplication', '@id': APP_ID,
  name: APP.name, url: `${SITE_URL}/`,
  operatingSystem: `${APP.minimumOs} or later`,
  applicationCategory: 'HealthApplication',
  installUrl: APP.canonicalStoreUrl,
  publisher: { '@id': ORG_ID },
  // description must reuse approved homepage copy verbatim (T15), e.g.:
  description: 'Log stool, meals and symptoms; Get Regular uses AI to surface patterns and daily gut and nutrition scores.',
  ...(APP.downloadOffer
    ? { offers: { '@type': 'Offer', price: APP.downloadOffer.price, priceCurrency: APP.downloadOffer.priceCurrency } }
    : {}),
};

export const homeGraph = () => ({ '@context': 'https://schema.org', '@graph': [organization, website, mobileApp] });

export const breadcrumb = (url: string, items: { name: string; path: string }[]) => ({
  '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`,
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: absoluteUrl(it.path) })),
});

const personNode = (p: Person) => ({
  '@type': 'Person', '@id': absoluteUrl(`/about#person-${p.id}`),
  name: p.name, ...(p.honorificSuffix ? { honorificSuffix: p.honorificSuffix } : {}),
  jobTitle: p.jobTitle, url: absoluteUrl(p.bioPath),
  ...(p.affiliation?.length ? { affiliation: p.affiliation.map((name) => ({ '@type': 'Organization', name })) } : {}),
  ...(p.sameAs?.length ? { sameAs: p.sameAs } : {}),
});

export function articleGraph(m: PostMeta, author: Person | null, reviewer: Person | null) {
  const url = absoluteUrl(`/blog/${m.slug}`);
  const modified = m.dateModified ?? m.datePublished;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage', '@id': `${url}#webpage`, url, name: m.title, inLanguage: 'en-US',
        isPartOf: { '@id': SITE_ID }, breadcrumb: { '@id': `${url}#breadcrumb` },
        datePublished: m.datePublished, dateModified: modified,
        // reviewedBy/lastReviewed are WebPage properties in schema.org — only when genuinely reviewed:
        ...(reviewer && m.lastReviewed ? { reviewedBy: { '@id': absoluteUrl(`/about#person-${reviewer.id}`) }, lastReviewed: m.lastReviewed } : {}),
      },
      {
        '@type': 'BlogPosting', '@id': `${url}#article`, headline: m.title, description: m.description,
        mainEntityOfPage: { '@id': `${url}#webpage` }, isPartOf: { '@id': absoluteUrl('/blog') },
        datePublished: m.datePublished, dateModified: modified,
        ...(m.image ? { image: [absoluteUrl(m.image.url)] } : {}),
        author: author ? { '@id': absoluteUrl(`/about#person-${author.id}`) } : { '@id': ORG_ID },
        publisher: { '@id': ORG_ID },
        ...(m.sources.length ? { citation: m.sources.map((s) => ({ '@type': 'CreativeWork', name: s.title, url: s.url })) } : {}),
      },
      breadcrumb(url, [{ name: 'Home', path: '/' }, { name: 'Journal', path: '/blog' }, { name: m.title, path: `/blog/${m.slug}` }]),
      ...[author, reviewer].filter((p, i, a): p is Person => !!p && a.findIndex((q) => q?.id === p.id) === i).map(personNode),
      organization,
    ],
  };
}
```

**Placement**
- `app/page.tsx` renders `<JsonLd data={homeGraph()} />`.
- `/blog` renders `<JsonLd data={{ '@context': 'https://schema.org', '@graph': [breadcrumb(absoluteUrl('/blog'), [{name:'Home',path:'/'},{name:'Journal',path:'/blog'}])] }} />`.
- Legal pages get a two-item breadcrumb.
- Remove the old inline `BlogPosting` script so each page has exactly one JSON-LD block.
- Person `@id`s point to `/about#person-…`. **Create `/about` before setting any `consentRecorded: true`.** Until then, authors fall back to the Organization.

**Acceptance criteria**
- The Rich Results Test and validator.schema.org show 0 errors for `/` and the article.
- `grep -c aggregateRating` returns 0.
- Every `@id` reference resolves inside the graph or to a live URL.

**Verify**
```bash
curl -s https://www.getregular.com/ | grep -o '<script type="application/ld+json">[^<]*' | sed 's/^.*">//' | python3 -m json.tool | grep -E '"@type"|"@id"'
curl -s https://www.getregular.com/ | grep -c 'aggregateRating'   # 0
```

---

## T8: Smart App Banner and app links [P2, F19]

- The root `metadata.itunes = { appId: '6749188690' }` (T4) emits `<meta name="apple-itunes-app" content="app-id=6749188690">`. Safari on iOS then shows the native banner.
- Add `appArgument: absoluteUrl(path)` **only** if the app actually handles incoming URLs. That is unverified, so do not add it by default.
- Keep `/.well-known/apple-app-site-association` as it is (200, `application/json`, `/invite/*`). Do not add a `Content-Type` override that breaks it. Do not redirect `.well-known` paths.
- Change the `/invite/[code]` web fallback to the storefront-neutral campaign URL from T14 with `ct=invite`. It currently uses the hard-coded CA URL.

**Verify**
```bash
curl -s https://www.getregular.com/ | grep -o '<meta name="apple-itunes-app"[^>]*>'
curl -sI https://www.getregular.com/.well-known/apple-app-site-association | grep -iE '^HTTP|content-type'   # 200, application/json
curl -sI https://www.getregular.com/invite/TEST | grep -i '^location'   # apps.apple.com/app/apple-store/id6749188690?...ct=invite
```

---

## T9: Branded 404 [P2, F20]

```tsx
// app/not-found.tsx
import Link from 'next/link';
import { AppStoreLink } from '@/components/AppStoreLink';
export const metadata = { title: 'Page not found', robots: { index: false, follow: true } };
export default function NotFound() {
  return (
    <main>
      <h1>We couldn’t find that page</h1>
      <p>The link may be old or mistyped.</p>
      <ul>
        <li><Link href="/">Get Regular home</Link></li>
        <li><Link href="/blog">The Journal</Link></li>
        <li><Link href="/legal/privacy-policy">Privacy Policy</Link></li>
      </ul>
      <AppStoreLink location="not_found">Download on the App Store</AppStoreLink>
    </main>
  );
}
```

Add redirects for observed or likely legacy paths in `next.config.ts`:

```ts
async redirects() {
  return [
    { source: '/privacy', destination: '/legal/privacy-policy', permanent: true },
    { source: '/privacy-policy', destination: '/legal/privacy-policy', permanent: true },
    { source: '/terms', destination: '/legal/terms-of-service', permanent: true },
    { source: '/terms-of-service', destination: '/legal/terms-of-service', permanent: true },
    { source: '/journal', destination: '/blog', permanent: true },
    // T1 host fallback goes here too if needed
  ];
}
```

**Acceptance criteria**
- Unknown paths return **404** (never 200) with branded HTML, a `noindex` meta, and ≥3 internal links.
- `/privacy` returns 308 to `/legal/privacy-policy`.

**Verify**
```bash
curl -s -o /tmp/nf.html -w '%{http_code}\n' https://www.getregular.com/zz-not-a-page && grep -c 'href="/' /tmp/nf.html   # 404 and >=3
curl -sI https://www.getregular.com/privacy | grep -iE '^HTTP|^location'
```

*Pages Router fallback:* `pages/404.tsx`.

---

## T10: Make above-the-fold content visible in server HTML (fixes LCP 22 s) [P0, F04]

**Problem.** The server HTML contains `<h1 … style="…opacity:0;transform:translateY(24px)">` and 54 other `opacity:0` elements. The H1 is the LCP element. It only paints after JS downloads, hydrates and runs Framer Motion, which takes **~22 s** on Lighthouse mobile. With JS disabled, the first screen is blank.

**Do**
1. Find the motion props:
   `grep -rn "initial={{ *opacity: *0" app components`
   and the Tailwind or CSS equivalents: `grep -rn "opacity-0" app components`.
2. For **hero elements** (eyebrow badge, H1, intro paragraph, CTA, hero phone and video): remove the opacity-from-0 animation. Choose one of these:
   - `initial={false}`, so it renders in its final state with no entrance animation; or
   - a CSS transform-only entrance that never hides content:

```css
/* app/globals.css */
@keyframes rise { from { transform: translateY(24px); } to { transform: none; } }
.hero-rise { animation: rise .6s cubic-bezier(.2,.7,.2,1) both; }
@media (prefers-reduced-motion: reduce) { .hero-rise { animation: none; } }
```

3. For **below-the-fold `whileInView` reveals**, keep them if design wants them. Add a no-JS safety net to `app/layout.tsx` `<head>`:

```tsx
<noscript><style>{`[style*="opacity:0"]{opacity:1!important;transform:none!important}`}</style></noscript>
```

4. Wrap the app in `<MotionConfig reducedMotion="user">`.

**Acceptance criteria**
- The server HTML `<h1>` has no `opacity:0`.
- The hero copy and CTA are visible with JS disabled.
- Lighthouse mobile on `/` has **LCP < 4 s** and **FCP < 2.5 s** (median of 3 runs). This requires T11–T13 as well.

**Verify**
```bash
curl -s https://www.getregular.com/ | grep -oE '<h1[^>]*>' | grep -c 'opacity:0'     # 0
CHROME_PATH=$(ls /opt/pw-browsers/chromium-*/chrome-linux/chrome | head -1) npx -y lighthouse@12 https://www.getregular.com/ \
  --chrome-flags="--headless=new --no-sandbox" --only-categories=performance --output=json --output-path=lh.json --quiet
node -e "const a=require('./lh.json').audits;console.log(a['first-contentful-paint'].displayValue,a['largest-contentful-paint'].displayValue)"
```

---

## T11: Facade the TikTok and YouTube embeds [P1, F06]

**Problem.** The six TikTok iframes in `#community` and the autoplaying YouTube iframe (`WEEbxLhSRT8`, in the section before `#how`) load eagerly. Together they cause ~460 third-party requests and ~3 MB, and they set third-party cookies.

```tsx
// components/embeds/TikTokFacade.tsx
'use client';
import { useState } from 'react';
import Image from 'next/image';

export function TikTokFacade({ id, author, poster, caption }: { id: string; author: string; poster: string; caption: string }) {
  const [on, setOn] = useState(false);
  const url = `https://www.tiktok.com/@${author}/video/${id}`;
  if (on) {
    return <iframe src={`https://www.tiktok.com/player/v1/${id}?music_info=1&description=1&autoplay=1`}
      className="w-full border-0 aspect-[9/16]" allow="encrypted-media; autoplay" allowFullScreen title={`TikTok by @${author}`} />;
  }
  return (
    <figure>
      <button type="button" onClick={() => setOn(true)} aria-label={`Play TikTok by @${author}`} className="relative w-full aspect-[9/16]">
        <Image src={poster} alt={caption} fill sizes="(max-width: 768px) 80vw, 320px" className="object-cover" />
        <span aria-hidden className="absolute inset-0 grid place-items-center">▶</span>
      </button>
      <figcaption><a href={url} rel="noopener" target="_blank">@{author} on TikTok</a></figcaption>
    </figure>
  );
}
```

- Posters: save one WebP frame per video to `public/images/community/<id>.webp` at 360×640, under 40 KB. **Third-party creators (@angpark, @hallysicle, @layla.atiles) must have given permission to feature their content.** That is an owner check.
- Replace the YouTube autoplay iframe with a self-hosted, muted, looping `<video>` that has a `poster`, `preload="none"`, and is started by an IntersectionObserver. If the YouTube embed must stay, use the same facade pattern as TikTok.
- Hero `onboarding-v1.mp4`: add a `poster` (first frame, WebP), explicit `width`/`height`, and `preload="metadata"` (already set). If possible, host it on the same origin or set a long `Cache-Control` on the GCS object (currently 1 h).

**Acceptance criteria**
- Initial homepage load makes **0 requests** to `tiktok.com`, `tiktokcdn*`, `youtube*` or `googlevideo.com`.
- Lighthouse `third-party-cookies` passes.
- Total mobile transfer is **< 1.5 MB**.

**Verify**
```bash
curl -s https://www.getregular.com/ | grep -cE '<iframe'      # 0 (iframes only after click)
```
Lighthouse: `resource-summary` third-party request count < 20.

---

## T12: Images and fonts [P1, F07, F23]

1. Replace the `<img>` tags with `next/image`:

```tsx
<Image src="/images/home.png" alt="Get Regular home screen showing daily Gut and Nutrition scores"
  width={684} height={1410} sizes="(max-width: 1024px) 180px, 260px" priority />   {/* only if it is above the fold on that breakpoint */}
<Image src="/images/schopis-cropped.png" alt="Dr. Michael Schopis, MD" width={96} height={96} sizes="48px" />  {/* lazy by default */}
```

   - Render **one** `home.png` image and switch its layout with CSS, rather than two copies toggled by breakpoint.
   - Re-export `schopis-cropped.png` at 192×192. The current source is 1406×1368 and 875 KB.
   - Write alt text that describes what the screenshot actually shows. Confirm it against the current app.
2. **Remove** `<link rel="preload" as="image" href="/images/schopis-cropped.png">` and the preload for `home.png`. Find them with `grep -rn "preload" app components`. Preloads belong only on the LCP resource, and after T10 the LCP is text.
3. `next.config.ts`: `images: { formats: ['image/avif', 'image/webp'] }`.
4. Fonts: in `next/font/local` for Able Lead, keep **only the `.woff2`** source. Delete the `.woff` entry, because both files are preloaded today. Keep `display: 'swap'` and `adjustFontFallback`. Set `preload: false` on any face not used above the fold. DM Sans via `next/font/google` should use `subsets: ['latin']`.

**Acceptance criteria**
- Lighthouse has no `image-delivery-insight` item over 50 KB and no `unsized-images` failure.
- The HTML has ≤ 2 font preloads, all `.woff2`.

**Verify**
```bash
curl -s https://www.getregular.com/ | grep -oE '<link rel="preload"[^>]+>'      # no schopis, no .woff (non-2)
curl -s https://www.getregular.com/ | grep -oE '<img[^>]+>' | grep -vcE 'width='  # 0
```

---

## T13: Defer PostHog and keep events [P2, F08]

**Problem.** The inline snippet loads `array.js`, `posthog-recorder.js` and `surveys.js` on every page. On mobile they block the main thread for ~1.2 s.

**Business decision (owner):** does the marketing site need session recordings and surveys? **Recommended default: disable both on marketing pages.** The site is health-adjacent and recordings add both privacy and performance cost.

```tsx
// components/analytics/PostHogInit.tsx
'use client';
import { useEffect } from 'react';
declare global { interface Window { posthog?: any; __phq?: [string, Record<string, unknown>][] } }

export function PostHogInit() {
  useEffect(() => {
    const start = async () => {
      const { default: posthog } = await import('posthog-js');
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: 'https://us.i.posthog.com',
        person_profiles: 'identified_only',     // keep existing setting
        disable_session_recording: true,         // business decision, see above
        disable_surveys: true,
      });
      window.posthog = posthog;
      (window.__phq ?? []).forEach(([e, p]) => posthog.capture(e, p));   // flush early clicks
      window.__phq = [];
    };
    const w = window as any;
    w.requestIdleCallback ? w.requestIdleCallback(start, { timeout: 4000 }) : setTimeout(start, 2500);
  }, []);
  return null;
}
```

- Remove the inline `posthog.init` snippet. Render `<PostHogInit />` once in `app/layout.tsx`.
- Move the project key into `NEXT_PUBLIC_POSTHOG_KEY` (current value is visible in page source: `phc_NlIRWmuA1MWWMDYI10nh3AEawcIZ02l8mLsfjZfoHYP`).
- `npm i posthog-js`.

**Acceptance criteria**
- No `posthog-recorder.js` or `surveys.js` request on page load (if disabled).
- `app_store_click` still arrives in PostHog: check Live events after clicking each CTA.
- Lighthouse `third-party-summary` shows PostHog blocking time < 150 ms.

---

## T14: One `AppStoreLink` with storefront-neutral URL, campaign tokens and a single click event [P1, F17, F18]

**Problem.** Every CTA hard-codes `https://apps.apple.com/ca/app/get-regular/id6749188690` (CA storefront, old slug, no `pt`/`ct`) with `rel="noopener noreferrer"`. `noreferrer` suppresses the referrer, which App Store Connect's "Web Referrer" source relies on.

```ts
// lib/appstore.ts
import { APP } from '@/lib/site';
const PT = process.env.NEXT_PUBLIC_APPLE_PROVIDER_TOKEN; // App Store Connect → Apps → App Analytics → Campaigns: copy provider token (pt). Do NOT guess.

export function appStoreUrl(ct: string) {
  const u = new URL(`https://apps.apple.com/app/apple-store/id${APP.appStoreId}`); // storefront-neutral; Apple routes to user's store
  if (PT) u.searchParams.set('pt', PT);
  u.searchParams.set('ct', ct.slice(0, 40));   // Apple campaign token limit: 40 chars
  u.searchParams.set('mt', '8');
  return u.toString();
}
```

```tsx
// components/AppStoreLink.tsx
'use client';
import { appStoreUrl } from '@/lib/appstore';

export type CtaLocation = 'nav' | 'mobile_nav' | 'sticky_cta' | 'hero' | 'how_it_works' | 'science' | 'final_cta'
  | 'footer' | 'blog_index' | 'blog_post_end' | 'not_found' | 'invite';

export function trackAppStoreClick(location: CtaLocation, ct: string) {
  const props = { location, ct, page_path: window.location.pathname };
  if (window.posthog?.capture) window.posthog.capture('app_store_click', props);   // existing event name — keep it
  else (window.__phq ??= []).push(['app_store_click', props]);
}

export function AppStoreLink({ location, campaign, className, children }:
  { location: CtaLocation; campaign?: string; className?: string; children: React.ReactNode }) {
  const ct = campaign ?? `web_${location}`;
  return (
    <a href={appStoreUrl(ct)} target="_blank" rel="noopener" className={className}
       data-cta="app-store" data-location={location}
       onClick={() => trackAppStoreClick(location, ct)}>
      {children}
    </a>
  );
}
```

- Replace **every** `apps.apple.com` literal in components with `<AppStoreLink location="…">`. The check is `grep -rn "apps.apple.com" app components | grep -v lib/appstore.ts`, which must return nothing.
- Keep the existing location values `nav`, `mobile_nav` and `sticky_cta`, so PostHog history stays continuous.
- One click must produce one `app_store_click`. PostHog's `$autocapture` is a separate event; do not count both.
- Report these as **store clicks, not installs**. Installs per `ct` come from App Store Connect campaign reports, which have thresholds.

**Acceptance criteria**
- All CTAs point to `https://apps.apple.com/app/apple-store/id6749188690?…ct=web_<location>&mt=8`, plus `pt` when configured.
- None use `noreferrer`.
- Each CTA fires one event with `location`, `ct` and `page_path`.

**Verify**
```bash
curl -s https://www.getregular.com/ | grep -oE 'href="https://apps.apple.com[^"]+"' | sort | uniq -c   # only /app/apple-store/id6749188690?...ct=web_...
curl -s https://www.getregular.com/ | grep -c 'apps.apple.com/ca/'   # 0
curl -s https://www.getregular.com/ | grep -oE '<a[^>]+apps.apple.com[^>]+>' | grep -c noreferrer   # 0
```
Manual check: on a US iPhone, tap each CTA. It should open the App Store app on the US listing. Repeat with a CA account if possible.

---

## T15: Copy and claims (OWNER plus qualified reviewer; Codex implements only approved text) [P0, F01, F14]

Codex: **do not change claims copy until the owner supplies approved wording.** Prepare the components so the strings live in one file (`content/home.ts`).

| Current | Required action |
|---|---|
| Badge "AI-Powered · Clinically Validated · Available on iOS" | Remove "Clinically Validated" unless a published validation study exists. Suggested: "AI gut health app for iPhone · Stool, meals & symptoms" |
| "40% of people worldwide struggle with gut health issues." | Cite a source inline, for example the Rome Foundation Global Epidemiology Study (Sperber et al., *Gastroenterology* 2021; verify the exact figure and wording), or remove |
| "$3,000+ … per year" / "3 years … correct diagnosis" | Remove unless a citable source is provided |
| "Thousands of people are already tracking" | Back it with internal data or soften ("People are already tracking…") |
| H1 "Your gut is talking. Are you listening?" | Keep the brand line, and add a visible category sentence directly under it, e.g. "Get Regular is an iPhone app that tracks your stool (Bristol scale), meals and symptoms, and uses AI to show what's affecting your gut." |
| "Personalized dietary and supplement recommendations" | Add a nearby disclaimer, e.g. "Not medical advice; talk to your clinician before changing supplements." |
| Advisor quote | Needs written approval from Dr. Schopis, plus a link to an `/about` bio |
| Testimonials | Need documented permission and the label "App user reviews". No implied typical outcomes |

---

## T16: Security headers [P2, F22]

```ts
// next.config.ts
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://us-assets.i.posthog.com",
  "connect-src 'self' https://us.i.posthog.com https://us-assets.i.posthog.com",
  "img-src 'self' data: blob: https:",
  "media-src 'self' https://storage.googleapis.com",
  "frame-src https://www.tiktok.com https://www.youtube-nocookie.com",
  "font-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

async headers() {
  return [{
    source: '/:path*',
    headers: [
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' }, // add '; preload' only after confirming every subdomain is HTTPS-only and the owner opts into hstspreload.org
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Content-Security-Policy-Report-Only', value: csp }, // switch to Content-Security-Policy after 1–2 weeks without violations
    ],
  }];
}
```

- Do **not** add `X-Robots-Tag` globally.
- Make sure `/.well-known/apple-app-site-association` keeps `Content-Type: application/json`.

**Verify**
```bash
curl -sI https://www.getregular.com/ | grep -iE 'strict-transport|x-content-type|referrer-policy|permissions-policy|x-frame|content-security'
```

---

## T17: Hygiene [P3, F24, F25, F26]

- **Icons and manifest:** add `app/favicon.ico` (multi-size 16/32/48), `app/icon.png` at **192×192 or larger** (Google favicon guidance prefers multiples of 48 px; the current file is 64×64), `app/apple-icon.png` (180×180), and `app/manifest.ts`:

```ts
import type { MetadataRoute } from 'next';
export default function manifest(): MetadataRoute.Manifest {
  return { name: 'Get Regular', short_name: 'Get Regular', start_url: '/', display: 'browser',
    background_color: '#111111', theme_color: '#111111', icons: [{ src: '/icon.png', sizes: '192x192', type: 'image/png' }] };
}
```

- **Contrast:** raise the `taupe-l*` and `accent` small-text tokens and the footer `text-white/28` to WCAG AA (4.5:1 for text under 18.66 px).
- **Duplicate H3s:** render the "How it works" steps once. Use CSS for the layout differences rather than two DOM copies.
- **Copyright:** `© {new Date().getFullYear()} Get Regular Health, Inc.`
- **Legal links:** no `target="_blank"` (T5).

**Verify:**
- `curl -s -o /dev/null -w '%{http_code}' https://www.getregular.com/favicon.ico` returns 200.
- `curl -s https://www.getregular.com/manifest.webmanifest | head -c 200` shows the manifest.
- Lighthouse a11y `color-contrast` passes.

---

## T18: IndexNow key route and ping script [P3, F27]

```ts
// app/indexnow-key.txt/route.ts   (folder name contains ".txt" — valid App Router route segment)
export const dynamic = 'force-static';
export function GET() {
  return new Response(process.env.INDEXNOW_KEY ?? '', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
```

```js
// scripts/indexnow.mjs — run after a production deploy: `node scripts/indexnow.mjs [url ...]` (defaults to all sitemap URLs)
const HOST = 'www.getregular.com';
const KEY = process.env.INDEXNOW_KEY;
if (!KEY || !/^[a-zA-Z0-9-]{8,128}$/.test(KEY)) throw new Error('INDEXNOW_KEY missing/invalid');
let urls = process.argv.slice(2);
if (!urls.length) {
  const xml = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
  urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/indexnow-key.txt`, urlList: urls }),
});
console.log('IndexNow', res.status, urls.length, 'urls');   // 200/202 = accepted
```

- Generate the key once with `openssl rand -hex 16`. Store it as a Vercel env var `INDEXNOW_KEY` (Production).
- Add the npm script `"indexnow": "node scripts/indexnow.mjs"`. Run it after deploys that add or change URLs (manually, or from a GitHub Action on `deployment_status == success`).

**Verify:** `curl -s https://www.getregular.com/indexnow-key.txt` returns the key. `npm run indexnow` prints `IndexNow 200` or `202`.

---

## T19: (Optional) `/llms.txt` [P3, F27]

This is not a Google ranking or AI Overviews requirement, and the expected effect is small. If the owner wants one, generate it from the registries so it never drifts:

```ts
// app/llms.txt/route.ts
import { STATIC_ROUTES } from '@/lib/content/routes';
import { getAllPosts } from '@/lib/content/posts';
import { absoluteUrl, APP } from '@/lib/site';
export const dynamic = 'force-static';
export async function GET() {
  const posts = await getAllPosts();
  const body = [
    '# Get Regular',
    '> iPhone app for tracking stool (Bristol scale), meals and symptoms, with AI-assisted pattern insights. Not a diagnostic tool.',
    '', `App Store: ${APP.canonicalStoreUrl}`, '', '## Pages',
    ...STATIC_ROUTES.filter((r) => r.indexable).map((r) => `- ${absoluteUrl(r.path)}`),
    '', '## Journal', ...posts.map((p) => `- [${p.title}](${absoluteUrl('/blog/' + p.slug)}): ${p.description}`),
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
```

---

## T20: Owner and ops tasks (not code) [P0, F29]

1. **Google Search Console:** verify `sc-domain:getregular.com` with a DNS TXT record, or have the verified owner grant access. Submit `https://www.getregular.com/sitemap.xml`. Run URL Inspection on `/`, `/blog` and the article, then request indexing. Check Settings → crawl stats after one week.
2. **Bing Webmaster Tools:** import from GSC and submit the sitemap. IndexNow (T18) feeds Bing.
3. **Vercel:** set apex→www to 308 (T1). Under Firewall, confirm that Bot Protection / Attack Challenge Mode is **off** for verified bots, or that verified bots are allowed. Check that the Firewall logs show 200s for real Googlebot, Bingbot and OAI-SearchBot IPs after launch.
4. **App Store Connect:** copy the provider token (`pt`) into `NEXT_PUBLIC_APPLE_PROVIDER_TOKEN` (T14).
5. **Claims:** approve the T15 copy with a qualified reviewer. Record the sources.

---

## T21: Regression script (add as `scripts/seo_check.py`; run in CI against preview and production)

```bash
#!/usr/bin/env bash
set -u; BASE=${1:-https://www.getregular.com}; fail=0
ok(){ echo "PASS $1"; }; ko(){ echo "FAIL $1"; fail=1; }
[ "$(curl -s -o /dev/null -w '%{http_code}' $BASE/robots.txt)" = 200 ] && ok robots || ko robots
curl -s $BASE/robots.txt | grep -q "Sitemap: https://www.getregular.com/sitemap.xml" && ok robots-sitemap || ko robots-sitemap
[ "$(curl -s -o /dev/null -w '%{http_code}' $BASE/sitemap.xml)" = 200 ] && ok sitemap || ko sitemap
for u in $(curl -s $BASE/sitemap.xml | grep -oE '<loc>[^<]+' | sed 's/<loc>//'); do
  path=${u#https://www.getregular.com}; page=$(curl -s "$BASE$path")
  [ "$(curl -s -o /dev/null -w '%{http_code}' "$BASE$path")" = 200 ] || ko "200 $path"
  echo "$page" | grep -qE "<link rel=\"canonical\" href=\"${u%/}/?\"" && ok "canonical $path" || ko "canonical $path"
  echo "$page" | grep -q 'application/ld+json' && ok "jsonld $path" || ko "jsonld $path"
done
[ "$(curl -s -o /dev/null -w '%{http_code}' $BASE/zz-404-check)" = 404 ] && ok 404 || ko 404
curl -s $BASE/ | grep -oE '<h1[^>]*>' | grep -q 'opacity:0' && ko h1-visible || ok h1-visible
curl -s $BASE/ | grep -q 'apps.apple.com/ca/' && ko appstore-ca || ok appstore-neutral
curl -s $BASE/ | grep -q 'name="apple-itunes-app"' && ok smart-banner || ko smart-banner
curl -s $BASE/ | grep -q 'aggregateRating' && ko no-fake-rating || ok no-fake-rating
curl -sI $BASE/ | grep -qi 'x-content-type-options: nosniff' && ok headers || ko headers
exit $fail
```

**Definition of done**
- `scripts/seo_check.py https://www.getregular.com` exits 0.
- Lighthouse mobile median of 3 runs on `/`: LCP < 4.0 s, TBT < 300 ms, CLS < 0.1, transfer < 1.5 MB.
- The Rich Results Test is clean for `/` and the article.
- GSC shows the sitemap as processed. This is owner-dependent.
