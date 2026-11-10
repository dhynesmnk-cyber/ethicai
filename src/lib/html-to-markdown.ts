// Converts the article HTML that Squarespace exports (paragraphs, headings, lists, bold, italic,
// links) into Markdown, which the article editor then converts to rich text. Used by
// scripts/import-squarespace.ts to bring the old /insights posts across.
//
// DECISION: a small purpose-built converter instead of a DOM-based HTML→Lexical conversion. The
// Squarespace posts use a handful of tags, and Markdown goes through the same converter as the
// seed and the editor's paste, so imported articles come out formatted like hand-written ones.

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  rsquo: '’',
  lsquo: '‘',
  rdquo: '”',
  ldquo: '“',
  mdash: '—',
  ndash: '–',
  hellip: '…',
}

export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === '#') {
      const point =
        code[1] === 'x' || code[1] === 'X' ? parseInt(code.slice(2), 16) : Number(code.slice(1))
      return Number.isFinite(point) ? String.fromCodePoint(point) : match
    }
    return ENTITIES[code.toLowerCase()] ?? match
  })
}

/** Moves spaces out of emphasis markers ("** bold **" isn't valid Markdown) and drops empty ones. */
function tidyEmphasis(marker: string, inner: string): string {
  const trimmed = inner.trim()
  if (!trimmed) return inner
  const lead = inner.startsWith(' ') ? ' ' : ''
  const trail = inner.endsWith(' ') ? ' ' : ''
  return `${lead}${marker}${trimmed}${marker}${trail}`
}

/** Inline HTML (inside a paragraph, heading or list item) to Markdown on one line. */
function inline(html: string, { emphasis = true } = {}): string {
  let s = html.replace(/<br\s*\/?>/gi, ' ')
  s = s.replace(
    /<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi,
    (_, href: string, text: string) => {
      const label = inline(text, { emphasis })
      return label ? `[${label}](${decodeEntities(href)})` : ''
    },
  )
  s = s.replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_, _tag, text: string) =>
    emphasis ? tidyEmphasis('**', text) : text,
  )
  s = s.replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_, _tag, text: string) =>
    emphasis ? tidyEmphasis('*', text) : text,
  )
  s = s.replace(/<[^>]+>/g, '')
  return decodeEntities(s).replace(/\s+/g, ' ').trim()
}

export function htmlToMarkdown(html: string): string {
  let s = html
  s = s.replace(/<(script|style|noscript)\b[\s\S]*?<\/\1>/gi, '')
  // Images and captions inside the body are dropped: the hero image is imported separately.
  s = s.replace(/<figure\b[\s\S]*?<\/figure>/gi, '')
  s = s.replace(/<img\b[^>]*>/gi, '')

  const blocks: string[] = []
  const push = (block: string) => {
    if (block.trim()) blocks.push(block)
  }

  // Walk the block-level elements in document order.
  const pattern = /<(h[1-6]|p|blockquote|ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi
  for (const match of s.matchAll(pattern)) {
    const tag = match[1].toLowerCase()
    const inner = match[2]
    if (tag[0] === 'h') {
      // Squarespace posts use h3 for sections and h4 below them: H2 and H3 on this site.
      const level = Number(tag[1]) <= 3 ? '##' : '###'
      push(`${level} ${inline(inner, { emphasis: false })}`)
    } else if (tag === 'p') {
      push(inline(inner))
    } else if (tag === 'blockquote') {
      push(`> ${inline(inner)}`)
    } else {
      const items = [...inner.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((li) => inline(li[1]))
      const lines = items
        .filter(Boolean)
        .map((item, i) => (tag === 'ol' ? `${i + 1}. ${item}` : `- ${item}`))
      push(lines.join('\n'))
    }
  }

  return blocks.join('\n\n').trim()
}

/** Plain text from inline HTML or Markdown, for excerpts. */
export function plainText(value: string): string {
  return decodeEntities(value.replace(/<[^>]+>/g, ' '))
    .replace(/[*_`#>]/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Shortens text to at most `max` characters, at a word boundary, with an ellipsis. */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.–—-]+$/, '')}…`
}
