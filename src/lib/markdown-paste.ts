// Decides when pasted text should be converted from Markdown into formatted article content.
// The article editor does this for the weekly maintainer, who drafts in Markdown (BUILD-SPEC §8).
// Kept free of editor code so the rules can be unit tested.

// Line-level Markdown: headings, bullet and numbered lists, quotes, horizontal rules.
const BLOCK_PATTERNS = [
  /^ {0,3}#{1,6}[ \t]+\S/m,
  /^ {0,3}[-*+][ \t]+\S/m,
  /^ {0,3}\d{1,3}[.)][ \t]+\S/m,
  /^ {0,3}>[ \t]?\S/m,
  /^ {0,3}(?:-{3,}|\*{3,}|_{3,})[ \t]*$/m,
]

// Inline Markdown that is unlikely to appear by accident: paired bold markers and links.
const INLINE_PATTERNS = [/\*\*[^*\n]+\*\*/, /__[^_\n]+__/, /\[[^\]\n]+\]\(https?:\/\/[^)\s]+\)/]

/** True when the text uses Markdown that the editor can turn into formatting. */
export function looksLikeMarkdown(text: string): boolean {
  if (!text.trim()) return false
  return [...BLOCK_PATTERNS, ...INLINE_PATTERNS].some((pattern) => pattern.test(text))
}

// Word, Google Docs and web pages put real structure on the clipboard as HTML. Code editors
// (and some terminals) add HTML too, but only styled <div>/<span> wrappers, so those still count
// as plain text.
const STRUCTURAL_HTML = /<(?:h[1-6]|p|ul|ol|li|table|blockquote|img|pre|hr)[\s>/]/i

/** True when the clipboard's HTML carries real document structure rather than just styling. */
export function hasStructuralHtml(html: string | null | undefined): boolean {
  return Boolean(html && STRUCTURAL_HTML.test(html))
}

/** Convert only plain Markdown text; anything already rich keeps the editor's normal paste. */
export function shouldConvertPaste(clipboard: {
  text: string | null | undefined
  html: string | null | undefined
}): boolean {
  return (
    Boolean(clipboard.text) &&
    !hasStructuralHtml(clipboard.html) &&
    looksLikeMarkdown(clipboard.text ?? '')
  )
}
