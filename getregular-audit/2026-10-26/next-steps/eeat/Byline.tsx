import Link from 'next/link'
import { bylineParts, type ArticleMeta } from './article-meta'

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/New_York' })

/**
 * Replaces the current "Get Regular Editorial Team · 6 minute read · October 20, 2026" line.
 * Renders server-side (no 'use client'), so crawlers and no-JS readers see it.
 */
export function Byline({ article, readingMinutes }: { article: ArticleMeta; readingMinutes: number }) {
  const b = bylineParts(article)
  return (
    <div className="article-byline">
      <p>
        {b.written.label} <Link href={b.written.href}>{b.written.name}</Link>
        {b.reviewed && (
          <>
            {' · '}
            {b.reviewed.label} <Link href={b.reviewed.href}>{b.reviewed.name}</Link> on{' '}
            <time dateTime={b.reviewed.date}>{fmt(b.reviewed.date)}</time>
          </>
        )}
      </p>
      <p>
        Published <time dateTime={b.published}>{fmt(b.published)}</time>
        {b.updated && (
          <>
            {' · '}Updated <time dateTime={b.updated}>{fmt(b.updated)}</time>
          </>
        )}
        {' · '}
        {readingMinutes} minute read · <Link href={b.policyHref}>How we write and review</Link>
      </p>
    </div>
  )
}
