import { describe, expect, it } from 'vitest'

import { hasBearerSecret, parseRevalidateBody } from '@/lib/revalidate-request'

describe('hasBearerSecret', () => {
  it('accepts only the exact secret as a bearer token', () => {
    expect(hasBearerSecret('Bearer s3cret', 's3cret')).toBe(true)
    expect(hasBearerSecret('Bearer s3cre', 's3cret')).toBe(false)
    expect(hasBearerSecret('Bearer s3cret ', 's3cret')).toBe(false)
    expect(hasBearerSecret('bearer s3cret', 's3cret')).toBe(false)
    expect(hasBearerSecret('s3cret', 's3cret')).toBe(false)
    expect(hasBearerSecret(null, 's3cret')).toBe(false)
  })

  it('never matches when no secret is configured', () => {
    expect(hasBearerSecret('Bearer ', '')).toBe(false)
    expect(hasBearerSecret('Bearer x', '')).toBe(false)
  })
})

describe('parseRevalidateBody', () => {
  it('treats no body or no paths as "every page"', () => {
    expect(parseRevalidateBody(null)).toEqual({ paths: [] })
    expect(parseRevalidateBody({})).toEqual({ paths: [] })
  })

  it('accepts site paths and drops duplicates', () => {
    expect(parseRevalidateBody({ paths: ['/', '/articles', '/articles/ai-and-hr', '/'] })).toEqual({
      paths: ['/', '/articles', '/articles/ai-and-hr'],
    })
  })

  it.each([
    ['a string body', 'everything'],
    ['an array body', ['/']],
    ['paths that are not a list', { paths: '/' }],
    ['an empty list', { paths: [] }],
    ['too many paths', { paths: Array.from({ length: 51 }, (_, i) => `/p${i}`) }],
    ['a full URL', { paths: ['https://example.com/'] }],
    ['a protocol-relative URL', { paths: ['//example.com'] }],
    ['a relative path', { paths: ['articles'] }],
    ['a query string', { paths: ['/articles?page=2'] }],
    ['spaces', { paths: ['/a b'] }],
    ['a non-string', { paths: [42] }],
    ['a very long path', { paths: [`/${'a'.repeat(250)}`] }],
  ])('refuses %s', (_, body) => {
    expect(parseRevalidateBody(body)).toHaveProperty('error')
  })
})
