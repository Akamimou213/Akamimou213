import { personBySlug, profileUrl, displayName, type Person } from './people'

/**
 * Per-article front matter for the E-E-A-T layer. Add these fields next to the existing title/slug/cluster.
 *
 * Dates are ISO 8601 WITH a timezone offset (Google uses Googlebot's timezone if you omit it).
 *  - publishedAt: when the article first went live. Never backdate. The 85 launch articles keep 2026-10-20.
 *  - updatedAt:   set only when the content meaningfully changes (facts, advice, sources), not for typo fixes
 *                 or redesigns. Drives dateModified, the visible "Updated" line and sitemap <lastmod>.
 *  - review:      set only after a named reviewer actually checked THIS article; reviewedAt is that date.
 */
export type ArticleMeta = {
  path: string // "/learn/bowel-health/bristol-stool-scale"
  title: string
  description: string
  cluster: string
  image: string // absolute URL, 1200×675 (16:9); add 4:3 and 1:1 crops if you have them
  publishedAt: string // "2026-10-20T09:00:00-04:00"
  updatedAt?: string
  author: string // person slug
  aiAssisted?: boolean // true → byline shows "Drafted with AI assistance, edited by …" per editorial policy
  review?: { reviewer: string; reviewedAt: string; scope: 'full medical review' | 'clinical accuracy spot-check' }
  sources: string[] // already present on the site; keep
}

const ORG_ID = 'https://www.getregular.com/#organization'
const SITE = 'https://www.getregular.com'

const personNode = (p: Person) => ({
  '@type': 'Person',
  '@id': `${profileUrl(p)}#person`,
  name: p.name,
  ...(p.honorificPrefix && { honorificPrefix: p.honorificPrefix }),
  ...(p.honorificSuffix && { honorificSuffix: p.honorificSuffix }),
  jobTitle: p.jobTitle,
  url: profileUrl(p),
  image: `${SITE}${p.image}`,
  sameAs: p.sameAs,
  worksFor: { '@id': ORG_ID },
})

/** JSON-LD for an article page: Article (author as Person) + the WebPage carrying reviewedBy/lastReviewed. */
export function articleJsonLd(a: ArticleMeta) {
  const author = personBySlug(a.author)
  const reviewer = a.review ? personBySlug(a.review.reviewer) : undefined
  const url = `${SITE}${a.path}`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: a.title,
        description: a.description,
        image: [a.image],
        datePublished: a.publishedAt,
        dateModified: a.updatedAt ?? a.publishedAt,
        author: [personNode(author)], // Google: Person for people, one entry per author, url to profile
        publisher: { '@id': ORG_ID },
        mainEntityOfPage: { '@id': url },
        citation: a.sources,
      },
      {
        // schema.org WebPage.reviewedBy / lastReviewed. Google documents no rich result for these;
        // they make the review explicit to machines and must match the visible reviewer line exactly.
        '@type': 'MedicalWebPage',
        '@id': url,
        url,
        name: a.title,
        isPartOf: { '@id': `${SITE}/#website` },
        ...(reviewer && a.review && { reviewedBy: personNode(reviewer), lastReviewed: a.review.reviewedAt }),
      },
    ],
  }
}

/** JSON-LD for /about/team/<slug> (Google supports ProfilePage markup for author profile pages). */
export function profilePageJsonLd(p: Person, articleCount: number) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      ...personNode(p),
      description: p.shortBio,
      ...(p.affiliations?.length && { affiliation: p.affiliations.map((name) => ({ '@type': 'Organization', name })) }),
      agentInteractionStatistic: { '@type': 'InteractionCounter', interactionType: 'https://schema.org/WriteAction', userInteractionCount: articleCount },
    },
  }
}

/** Visible byline text, so markup and page always say the same thing. */
export function bylineParts(a: ArticleMeta) {
  const author = personBySlug(a.author)
  const reviewer = a.review ? personBySlug(a.review.reviewer) : undefined
  return {
    written: { label: a.aiAssisted ? 'Drafted with AI assistance, edited by' : 'Written by', name: displayName(author), href: `/about/team/${author.slug}` },
    reviewed: reviewer && a.review ? { label: 'Medically reviewed by', name: displayName(reviewer), href: `/about/team/${reviewer.slug}`, date: a.review.reviewedAt } : undefined,
    published: a.publishedAt,
    updated: a.updatedAt,
    policyHref: '/science/editorial-policy',
  }
}

/** Sitemap <lastmod> for an article. */
export const lastModified = (a: ArticleMeta) => a.updatedAt ?? a.publishedAt
