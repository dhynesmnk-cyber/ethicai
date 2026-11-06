import { describe, expect, it } from 'vitest'

import { hasStructuralHtml, looksLikeMarkdown, shouldConvertPaste } from '@/lib/markdown-paste'

describe('looksLikeMarkdown', () => {
  it('recognises headings, lists, quotes and rules', () => {
    expect(looksLikeMarkdown('## Why it matters\n\nSome text.')).toBe(true)
    expect(looksLikeMarkdown('- one\n- two')).toBe(true)
    expect(looksLikeMarkdown('* one\n* two')).toBe(true)
    expect(looksLikeMarkdown('1. First\n2. Second')).toBe(true)
    expect(looksLikeMarkdown('> A pull quote')).toBe(true)
    expect(looksLikeMarkdown('Intro\n\n---\n\nMore')).toBe(true)
  })

  it('recognises bold text and links', () => {
    expect(looksLikeMarkdown('This is **important** to know.')).toBe(true)
    expect(looksLikeMarkdown('See [our guide](https://example.com/guide) for more.')).toBe(true)
  })

  it('leaves ordinary text alone', () => {
    expect(looksLikeMarkdown('')).toBe(false)
    expect(looksLikeMarkdown('   \n  ')).toBe(false)
    expect(looksLikeMarkdown('Just a sentence, pasted in.')).toBe(false)
    expect(looksLikeMarkdown('Two paragraphs.\n\nStill plain text.')).toBe(false)
    expect(looksLikeMarkdown('Cost: 5 * 3 = 15, and #1 is best.')).toBe(false)
    expect(looksLikeMarkdown('Founded in 2026. We help teams.')).toBe(false)
    expect(looksLikeMarkdown('Use the #hashtag')).toBe(false)
    expect(looksLikeMarkdown('A link in [brackets] and (parentheses).')).toBe(false)
  })
})

describe('hasStructuralHtml', () => {
  it('treats Word, Google Docs and web page content as rich', () => {
    expect(hasStructuralHtml('<p class="MsoNormal">Hello</p>')).toBe(true)
    expect(hasStructuralHtml('<h2>Heading</h2><ul><li>One</li></ul>')).toBe(true)
    expect(hasStructuralHtml('<meta charset="utf-8"><img src="x.png">')).toBe(true)
  })

  it('ignores the styled wrappers code editors add', () => {
    const vscode =
      '<meta charset="utf-8"><div style="color: #ccc;white-space: pre;"><div><span style="color: #569cd6;">## Heading</span></div></div>'
    expect(hasStructuralHtml(vscode)).toBe(false)
    expect(hasStructuralHtml('')).toBe(false)
    expect(hasStructuralHtml(null)).toBe(false)
  })

  it('does not mistake tags that merely start with the same letters', () => {
    expect(hasStructuralHtml('<span>hello</span><pre-x>')).toBe(false)
    expect(hasStructuralHtml('<paragraph>x</paragraph>')).toBe(false)
  })
})

describe('shouldConvertPaste', () => {
  const markdown = '## Heading\n\n- one\n- two'

  it('converts plain Markdown', () => {
    expect(shouldConvertPaste({ text: markdown, html: '' })).toBe(true)
    expect(shouldConvertPaste({ text: markdown, html: null })).toBe(true)
  })

  it('converts Markdown copied from a code editor', () => {
    const html =
      '<meta charset="utf-8"><div style="white-space: pre;"><span>## Heading</span></div>'
    expect(shouldConvertPaste({ text: markdown, html })).toBe(true)
  })

  it('leaves rich content to the editor, even when its text looks like Markdown', () => {
    expect(
      shouldConvertPaste({ text: markdown, html: '<h2>Heading</h2><ul><li>one</li></ul>' }),
    ).toBe(false)
  })

  it('leaves plain text and empty clipboards alone', () => {
    expect(shouldConvertPaste({ text: 'Nothing special here.', html: '' })).toBe(false)
    expect(shouldConvertPaste({ text: '', html: '' })).toBe(false)
    expect(shouldConvertPaste({ text: null, html: null })).toBe(false)
  })
})
