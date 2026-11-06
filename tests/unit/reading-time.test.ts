import { describe, expect, it } from 'vitest'

import { countWords, readingMinutes } from '@/lib/reading-time'

const paragraph = (text: string) => ({ type: 'paragraph', children: [{ type: 'text', text }] })
const doc = (...children: unknown[]) => ({ root: { type: 'root', children } })

describe('reading time', () => {
  it('counts words across nested Lexical nodes, ignoring blocks', () => {
    const content = doc(
      paragraph('Most organisations start with a tool.'),
      {
        type: 'list',
        children: [{ type: 'listitem', children: [{ type: 'text', text: 'Ask  why' }] }],
      },
      { type: 'block', fields: { blockType: 'youtube', url: 'https://youtu.be/x' } },
    )
    expect(countWords(content)).toBe(8)
  })

  it('rounds to whole minutes at 220 words a minute, never below one', () => {
    expect(readingMinutes(doc(paragraph('word '.repeat(10))))).toBe(1)
    expect(readingMinutes(doc(paragraph('word '.repeat(880))))).toBe(4)
    expect(readingMinutes(null)).toBe(1)
  })
})
