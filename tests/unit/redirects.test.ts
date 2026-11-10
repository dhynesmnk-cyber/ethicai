import { readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { LEGACY_REDIRECTS } from '@/lib/redirects'
import { SERVICE_DEFAULTS } from '@/content/defaults'

// Every address in the old Squarespace sitemap must keep working after the domain moves: either
// the page exists here, or a permanent redirect sends it to one that does.

const oldPaths = readFileSync(
  path.resolve(__dirname, '../fixtures/squarespace/sitemap-paths.txt'),
  'utf8',
)
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean)

const serviceSlugs = SERVICE_DEFAULTS.map((service) => service.slug)
// The seven posts imported with their original slugs (scripts/import-squarespace.ts).
const importedSlugs = oldPaths
  .filter((p) => p.startsWith('/insights/'))
  .map((p) => p.slice('/insights/'.length))

const STATIC_PAGES = [
  '/',
  '/about',
  '/services',
  '/articles',
  '/watch',
  '/newsletter',
  '/contact',
  '/privacy-policy',
]

function existsHere(target: string): boolean {
  if (STATIC_PAGES.includes(target)) return true
  const service = target.match(/^\/services\/([^/]+)$/)
  if (service) return serviceSlugs.includes(service[1])
  const article = target.match(/^\/articles\/([^/]+)$/)
  if (article) return importedSlugs.includes(article[1])
  return false
}

/** Next.js-style matching for the patterns used here: ":name" and ":name*". */
function resolve(pathname: string): string | null {
  for (const rule of LEGACY_REDIRECTS) {
    if (rule.has) continue // query-specific rules don't apply to plain paths
    const pattern = new RegExp(
      `^${rule.source.replace(/:(\w+)\*/g, '(?<$1>.*)').replace(/:(\w+)/g, '(?<$1>[^/]+)')}$`,
    )
    const match = pathname.match(pattern)
    if (match) {
      return rule.destination.replace(/:(\w+)\*?/g, (_, name: string) => match.groups?.[name] ?? '')
    }
  }
  return null
}

describe('legacy Squarespace URLs', () => {
  it('has the whole old sitemap to check against', () => {
    expect(oldPaths.length).toBeGreaterThanOrEqual(27)
  })

  it.each(oldPaths)('%s still leads somewhere real', (oldPath) => {
    const target = existsHere(oldPath) ? oldPath : resolve(oldPath)
    expect(target, `${oldPath} has no page and no redirect`).not.toBeNull()
    expect(existsHere(target!), `${oldPath} → ${target}, which doesn’t exist`).toBe(true)
  })

  it('only uses permanent redirects', () => {
    expect(LEGACY_REDIRECTS.every((rule) => rule.permanent)).toBe(true)
  })

  it('never redirects a page that exists here', () => {
    for (const rule of LEGACY_REDIRECTS) expect(STATIC_PAGES).not.toContain(rule.source)
  })
})
