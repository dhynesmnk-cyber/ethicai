// Reading time for article cards and the article meta row (BUILD-SPEC §5.2), from the word count
// of the Lexical content. Computed when rendering rather than stored, so it can never go stale.

const WORDS_PER_MINUTE = 220

export function countWords(node: unknown): number {
  if (!node || typeof node !== 'object') return 0
  let words = 0
  if ('text' in node && typeof node.text === 'string') {
    words += node.text.split(/\s+/).filter(Boolean).length
  }
  if ('root' in node) words += countWords(node.root)
  if ('children' in node && Array.isArray(node.children)) {
    for (const child of node.children) words += countWords(child)
  }
  return words
}

/** Whole minutes, at least 1. */
export function readingMinutes(content: unknown): number {
  return Math.max(1, Math.round(countWords(content) / WORDS_PER_MINUTE))
}
