/**
 * People registry: the single source for bylines, reviewer lines, profile pages and Person JSON-LD.
 *
 * Rules (from the site's own editorial policy, plus Google's Article guidance):
 *  - Only list real people who agreed to be named, in the role they actually perform.
 *  - "author" = the person who wrote or substantively edited the piece (AI-assisted drafts included,
 *    disclosed per /science/editorial-policy). Never put a clinician's name on a piece they didn't review.
 *  - "reviewer" = a credentialed person who checked the medical content of that specific article
 *    on a specific date. Store the date per article, not here.
 *  - Every person needs a public profile page at /about/team/<slug> before their name appears in a byline.
 *
 * The entries below are PLACEHOLDERS showing the shape. Replace them; don't ship them.
 */
export type Person = {
  slug: string
  name: string // name only, no "Dr." or credentials (Google: put those in honorificPrefix/Suffix)
  honorificPrefix?: string // "Dr."
  honorificSuffix?: string // "MD", "RD", "PhD"
  jobTitle: string // "Clinical Advisor, Gastroenterology", "Head of Content"
  roles: Array<'author' | 'editor' | 'medical-reviewer'>
  shortBio: string // 1–2 sentences, shown under bylines
  bio: string[] // paragraphs for the profile page: training, practice, what they do at Get Regular
  credentials?: { label: string; verifyUrl?: string }[] // board certification, licence, NPI registry link
  affiliations?: string[] // hospitals, practices, universities
  disclosure?: string // relationship to Get Regular, e.g. "Paid clinical advisor since 2025."
  image: string // square photo, ≥ 400×400
  sameAs: string[] // LinkedIn, Doximity, practice page, ORCID, Google Scholar
}

export const PEOPLE: Person[] = [
  {
    slug: 'REPLACE-editor',
    name: 'REPLACE Editor Name',
    jobTitle: 'Head of Content',
    roles: ['author', 'editor'],
    shortBio: 'REPLACE: who they are and why they edit Get Regular’s library.',
    bio: ['REPLACE'],
    image: '/images/team/REPLACE.jpg',
    sameAs: ['https://www.linkedin.com/in/REPLACE'],
  },
  {
    slug: 'michael-schopis',
    name: 'Michael Schopis',
    honorificPrefix: 'Dr.',
    honorificSuffix: 'MD',
    jobTitle: 'Clinical Advisor, Gastroenterology',
    roles: ['medical-reviewer'], // ONLY if he agrees to review articles; today the site says he does not
    shortBio: 'REPLACE with wording he approves.',
    bio: ['REPLACE with wording he approves.'],
    credentials: [{ label: 'REPLACE: board certification', verifyUrl: 'https://npiregistry.cms.hhs.gov/' }],
    affiliations: ['REPLACE: confirm current affiliations with him'],
    disclosure: 'REPLACE: e.g. "Paid clinical advisor to Get Regular Health, Inc."',
    image: '/images/schopis.png',
    sameAs: [],
  },
]

export const personBySlug = (slug: string) => {
  const p = PEOPLE.find((x) => x.slug === slug)
  if (!p) throw new Error(`Unknown person "${slug}" in article front matter`)
  if (JSON.stringify(p).includes('REPLACE')) throw new Error(`Person "${slug}" still has placeholder fields`)
  return p
}

export const displayName = (p: Person) =>
  [p.honorificPrefix, p.name].filter(Boolean).join(' ') + (p.honorificSuffix ? `, ${p.honorificSuffix}` : '')

export const profileUrl = (p: Person) => `https://www.getregular.com/about/team/${p.slug}`
