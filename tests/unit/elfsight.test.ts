import { describe, expect, it } from 'vitest'

import {
  elfsightAppClass,
  isElfsightWidgetId,
  normaliseElfsightWidgetId,
  parseElfsightWidgetId,
  validateElfsightWidgetId,
} from '@/lib/elfsight'

const ID = '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d'
const OTHER = 'ffffffff-0000-4000-8000-000000000000'
const installCode = `<!-- Elfsight TikTok Feed | EthicAI -->
<script src="https://elfsightcdn.com/platform.js" async></script>
<div class="elfsight-app-${ID}" data-elfsight-app-lazy></div>`

describe('isElfsightWidgetId', () => {
  it('accepts only a bare lower-case widget ID', () => {
    expect(isElfsightWidgetId(ID)).toBe(true)
    expect(isElfsightWidgetId(ID.toUpperCase())).toBe(false)
    expect(isElfsightWidgetId(` ${ID}`)).toBe(false)
    expect(isElfsightWidgetId(`elfsight-app-${ID}`)).toBe(false)
  })

  it.each([null, undefined, 42, '', 'abc', `${ID}x`, `${ID}"><script>`, ID.replace(/-/g, '')])(
    'rejects %j',
    (value) => {
      expect(isElfsightWidgetId(value)).toBe(false)
    },
  )
})

describe('parseElfsightWidgetId', () => {
  it.each([
    ['the bare ID', ID],
    ['the ID with spaces and capitals', `  ${ID.toUpperCase()}\n`],
    ['the class name', `elfsight-app-${ID}`],
    ['the whole install code', installCode],
    ['install code that repeats the same ID', `${installCode}\n<div class="elfsight-app-${ID}">`],
  ])('reads the ID from %s', (_, input) => {
    expect(parseElfsightWidgetId(input)).toBe(ID)
  })

  it.each([
    ['nothing', ''],
    ['a non-string', 123],
    ['an ID with extra text', `${ID} please`],
    ['an injection attempt', `${ID}" onload="alert(1)`],
    ['a script', '<script src="https://evil.example/x.js"></script>'],
    ['an install code without an ID', '<div class="elfsight-app-"></div>'],
    [
      'two different widgets',
      `<div class="elfsight-app-${ID}"></div><div class="elfsight-app-${OTHER}"></div>`,
    ],
    ['a truncated ID', 'elfsight-app-1a2b3c4d-5e6f-7a8b-9c0d'],
  ])('returns null for %s', (_, input) => {
    expect(parseElfsightWidgetId(input)).toBeNull()
  })
})

describe('validateElfsightWidgetId (admin field)', () => {
  it('allows empty, an ID or the install code', () => {
    expect(validateElfsightWidgetId(null)).toBe(true)
    expect(validateElfsightWidgetId('')).toBe(true)
    expect(validateElfsightWidgetId('   ')).toBe(true)
    expect(validateElfsightWidgetId(ID)).toBe(true)
    expect(validateElfsightWidgetId(installCode)).toBe(true)
  })

  it('explains what to paste otherwise', () => {
    expect(validateElfsightWidgetId('my-widget')).toMatch(/widget ID/)
  })
})

describe('normaliseElfsightWidgetId (admin field hook)', () => {
  it('stores the bare ID, clears blanks and leaves bad input for validation to reject', () => {
    expect(normaliseElfsightWidgetId(installCode)).toBe(ID)
    expect(normaliseElfsightWidgetId('  ')).toBeNull()
    expect(normaliseElfsightWidgetId('my-widget')).toBe('my-widget')
    expect(normaliseElfsightWidgetId(undefined)).toBeUndefined()
  })
})

describe('elfsightAppClass', () => {
  it('builds the class Elfsight looks for', () => {
    expect(elfsightAppClass(ID)).toBe(`elfsight-app-${ID}`)
  })

  it('refuses anything that is not a stored widget ID', () => {
    expect(() => elfsightAppClass(`${ID} other-class`)).toThrow()
    expect(() => elfsightAppClass(ID.toUpperCase())).toThrow()
  })
})
