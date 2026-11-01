import { readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

// Phase 2 acceptance: contrast checks pass (WCAG 2.2 AA). Tokens are read straight from the
// stylesheet so a palette change can't skip this check.

const css = readFileSync(path.resolve(__dirname, '../../src/app/(frontend)/globals.css'), 'utf8')
const tokens = Object.fromEntries(
  [...css.matchAll(/--color-([a-z-]+):\s*(#[0-9a-f]{6})/gi)].map(([, name, hex]) => [name, hex]),
)

const luminance = (hex: string) => {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const backgrounds = ['canvas', 'surface', 'sand']

describe('palette contrast', () => {
  it('defines every token the checks rely on', () => {
    for (const name of [...backgrounds, 'ink', 'muted', 'accent', 'accent-strong', 'accent-tint']) {
      expect(tokens[name], name).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it.each(
    ['ink', 'muted', 'accent', 'accent-strong', 'danger'].flatMap((fg) =>
      backgrounds.map((bg) => [fg, bg]),
    ),
  )('%s text on %s meets 4.5:1', (fg, bg) => {
    expect(contrast(tokens[fg], tokens[bg])).toBeGreaterThanOrEqual(4.5)
  })

  it.each([
    ['white', 'accent'],
    ['white', 'accent-strong'],
    ['accent', 'accent-tint'],
    ['ink', 'accent-tint'],
  ])('%s text on %s meets 4.5:1', (fg, bg) => {
    expect(contrast(tokens[fg], tokens[bg])).toBeGreaterThanOrEqual(4.5)
  })

  it.each(backgrounds)('focus ring and form borders on %s meet 3:1', (bg) => {
    expect(contrast(tokens.accent, tokens[bg])).toBeGreaterThanOrEqual(3)
    expect(contrast(tokens['line-strong'], tokens[bg])).toBeGreaterThanOrEqual(3)
  })
})
