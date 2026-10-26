/**
 * Drop-in replacement for the PostHog `before_send` sanitizer on getregular.com.
 *
 * What changes vs. the live version (tested 26 Oct 2026):
 *  1. `allowedPaths` comes from the content registry at build time (see `getPublicPaths` below),
 *     so a new weekly article is tracked by its real path instead of `/not-found`.
 *  2. Campaign UTMs (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, and their `$initial_` /
 *     `$set_once` forms) are kept. `utm_term` and ad click IDs are still dropped: a search term can name a
 *     condition, and click IDs are person-level identifiers that PostHog doesn't need.
 *  3. The same filter runs over `properties`, `$set` and `$set_once` (the live one skips `$set*`, so
 *     `$initial_current_url` keeps its full query string).
 *
 * Everything else is unchanged: query strings and hashes are stripped from URLs, referrers are cut to their
 * origin, `/invite/<code>` collapses to `/invite`, unknown same-site paths become `/not-found`, and keys that
 * look like email/phone/password/token/notes/message/symptom/photo are removed.
 *
 * The function must stay self-contained (no imports, no outer variables) because the layout serializes it
 * into the inline `posthog.init` snippet with `sanitizeEvent.toString()`.
 * Get legal sign-off on the kept-UTM list before shipping.
 */
export function sanitizeEvent(event: any, allowedPaths: string[], projectToken: string): any {
  if (!event) return null
  const KEEP_UTM = /^(\$initial_)?utm_(source|medium|campaign|content)$/
  const DROP_KEY = /(?:^|[_$])(?:email|phone|password|token|notes|message|symptom|photo)(?:[_$]|$)/
  const CLICK_IDS = ['gclid', 'gbraid', 'wbraid', 'fbclid', 'ttclid', 'msclkid', 'twclid', 'li_fat_id']
  const OWN_HOSTS = ['getregular.com', 'www.getregular.com', 'localhost', '127.0.0.1']
  const allowed = new Set(allowedPaths)

  const cleanPath = (p: string): string => {
    const path = p.split(/[?#]/, 1)[0].replace(/\/+$/, '') || '/'
    if (path.startsWith('/invite/')) return '/invite'
    return allowed.has(path) ? path : '/not-found'
  }

  const cleanValue = (key: string, value: string): string => {
    try {
      if (/^https?:\/\//.test(value)) {
        const u = new URL(value)
        u.search = ''
        u.hash = ''
        if (/referr/.test(key)) u.pathname = '/'
        else if (OWN_HOSTS.includes(u.hostname)) u.pathname = cleanPath(u.pathname)
        return u.toString()
      }
      return value.startsWith('/') ? cleanPath(value) : value.split(/[?#]/, 1)[0]
    } catch {
      return '[redacted]'
    }
  }

  const walk = (obj: any, depth = 0): any => {
    if (depth > 8) return null
    if (Array.isArray(obj)) return obj.map((v) => walk(v, depth + 1))
    if (!obj || typeof obj !== 'object') return obj
    return Object.fromEntries(
      Object.entries(obj).flatMap(([key, value]) => {
        const k = key.toLowerCase()
        if (depth === 0 && key === 'token' && value === projectToken) return [[key, value]]
        if (['__proto__', 'constructor', 'prototype'].includes(k)) return []
        if (KEEP_UTM.test(k)) return [[key, typeof value === 'string' ? value.slice(0, 100) : value]]
        if (k.includes('utm_') || CLICK_IDS.includes(k.replace(/^\$initial_/, '')) || DROP_KEY.test(k)) return []
        if (typeof value === 'string' && (/url|path|referr/.test(k) || /^https?:\/\//.test(value))) {
          return [[key, cleanValue(k, value)]]
        }
        return [[key, walk(value, depth + 1)]]
      }),
    )
  }

  const out = { ...event, properties: walk(event.properties ?? {}) }
  if (event.$set) out.$set = walk(event.$set)
  if (event.$set_once) out.$set_once = walk(event.$set_once)
  return out
}

/*
 * Wiring (app/layout.tsx or wherever the inline snippet lives). The allowlist must come from the SAME source
 * as app/sitemap.ts so the two can never drift:
 *
 *   // lib/public-paths.ts
 *   import { getAllArticles, STATIC_ROUTES } from '@/content/registry'   // whatever feeds sitemap.ts today
 *   export function getPublicPaths(): string[] {
 *     return ['/', '/invite', ...STATIC_ROUTES, ...getAllArticles().map((a) => a.path)]
 *   }
 *
 *   // app/sitemap.ts → build entries from getPublicPaths() too.
 *
 *   // app/layout.tsx
 *   import { sanitizeEvent } from '@/lib/posthog-before-send'
 *   import { getPublicPaths } from '@/lib/public-paths'
 *   const beforeSend = `function(event){return (${sanitizeEvent.toString()})(event, ${JSON.stringify(
 *     getPublicPaths(),
 *   )}, ${JSON.stringify(process.env.NEXT_PUBLIC_POSTHOG_KEY)});}`
 *   // ...then in the snippet: posthog.init(KEY, { ..., before_send: ${beforeSend} })
 *
 * Note: if the TypeScript build emits helpers into the function body, compile this file with target ES2020+
 * (Next's default) so `toString()` stays self-contained. Verify by viewing source after deploy.
 */
