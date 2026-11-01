import { XMLParser } from 'fast-xml-parser'

// Recent newsletter issues from the Substack publication's public feed (BUILD-SPEC §7.2).
// Never throws: any failure returns an empty list and the page shows its fallback.
// DECISION: fast-xml-parser (as the spec suggests) — small, dependency-free, handles RSS and Atom.

export type NewsletterIssue = {
  title: string
  link: string
  pubDate: string | null
  excerpt: string
}

const EXCERPT_LENGTH = 200

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  textNodeName: '#text',
  isArray: (name) => name === 'item' || name === 'entry' || name === 'link',
})

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  hellip: '…',
  rsquo: '’',
  lsquo: '‘',
  rdquo: '”',
  ldquo: '“',
  mdash: '—',
  ndash: '–',
}

function decodeEntities(value: string): string {
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] === '#') {
      const code =
        entity[1]?.toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1))
      return Number.isFinite(code) ? String.fromCodePoint(code) : match
    }
    return NAMED_ENTITIES[entity.toLowerCase()] ?? match
  })
}

/** Plain text from an HTML fragment, trimmed to a sentence-friendly length. */
export function toExcerpt(html: string, maxLength = EXCERPT_LENGTH): string {
  const text = decodeEntities(html.replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
  if (text.length <= maxLength) return text
  const cut = text.slice(0, maxLength)
  return `${cut.slice(0, cut.lastIndexOf(' ') > 0 ? cut.lastIndexOf(' ') : maxLength).trimEnd()}…`
}

const text = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (value && typeof value === 'object' && '#text' in value) return text(value['#text'])
  return ''
}

const toIsoDate = (value: string): string | null => {
  const time = Date.parse(value)
  return Number.isNaN(time) ? null : new Date(time).toISOString()
}

type Entry = Record<string, unknown>

/** Atom links are elements with an href attribute; prefer rel="alternate" (or no rel). */
function atomLink(links: unknown): string {
  if (!Array.isArray(links)) return ''
  const candidates = links.filter((l): l is Entry => typeof l === 'object' && l !== null)
  const alternate = candidates.find((l) => !l.rel || l.rel === 'alternate') ?? candidates[0]
  return alternate ? text(alternate.href) : ''
}

/** Parses an RSS 2.0 or Atom document into the newest issues first. */
export function parseFeed(xml: string, limit = 5): NewsletterIssue[] {
  let document: Entry
  try {
    document = parser.parse(xml) as Entry
  } catch {
    return []
  }

  const rss = (document.rss as Entry | undefined)?.channel as Entry | undefined
  const atom = document.feed as Entry | undefined
  const entries: Entry[] =
    (rss?.item as Entry[] | undefined) ?? (atom?.entry as Entry[] | undefined) ?? []

  const issues = entries
    .map((entry): NewsletterIssue => {
      const isAtom = !rss
      const rawLink = isAtom
        ? atomLink(entry.link)
        : text(Array.isArray(entry.link) ? entry.link[0] : entry.link)
      const rawDate = text(entry.pubDate ?? entry.published ?? entry.updated)
      const rawSummary = text(entry.description ?? entry.summary ?? entry['content:encoded'] ?? '')
      return {
        title: decodeEntities(text(entry.title)).trim(),
        link: rawLink.trim(),
        pubDate: rawDate ? toIsoDate(rawDate) : null,
        excerpt: toExcerpt(rawSummary),
      }
    })
    .filter((issue) => issue.title && /^https?:\/\//.test(issue.link))

  issues.sort((a, b) => (b.pubDate ?? '').localeCompare(a.pubDate ?? ''))
  return issues.slice(0, limit)
}

/** Fetches the publication's feed (cached for an hour). Returns [] on any problem. */
export async function getNewsletterIssues(
  publicationUrl: string | null | undefined,
  limit = 5,
): Promise<NewsletterIssue[]> {
  if (!publicationUrl) return []
  try {
    const response = await fetch(`${publicationUrl.replace(/\/+$/, '')}/feed`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) return []
    return parseFeed(await response.text(), limit)
  } catch {
    return []
  }
}
