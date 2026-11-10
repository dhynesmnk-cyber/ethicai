import { afterEach, describe, expect, it, vi } from 'vitest'

import robots from '@/app/robots'
import { isReviewSite } from '@/lib/site-url'

afterEach(() => vi.unstubAllEnvs())

describe('isReviewSite', () => {
  it('is true for Netlify review addresses, including deploy previews', () => {
    expect(isReviewSite('https://ethicaiau.netlify.app')).toBe(true)
    expect(isReviewSite('https://deploy-preview-3--ethicaiau.netlify.app')).toBe(true)
  })

  it('is false for the real domain, localhost and anything unparseable', () => {
    expect(isReviewSite('https://www.ethicai.au')).toBe(false)
    expect(isReviewSite('http://localhost:3000')).toBe(false)
    expect(isReviewSite('https://netlify.app.example.com')).toBe(false)
    expect(isReviewSite('not a url')).toBe(false)
  })

  it('reads NEXT_PUBLIC_SITE_URL by default', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://ethicaiau.netlify.app')
    expect(isReviewSite()).toBe(true)
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://www.ethicai.au')
    expect(isReviewSite()).toBe(false)
  })
})

describe('robots.txt', () => {
  it('blocks every crawler on a review site, and lists no sitemap', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://ethicaiau.netlify.app')
    expect(robots()).toEqual({ rules: { userAgent: '*', disallow: '/' } })
  })

  it('allows the public site but keeps the admin and API out', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://www.ethicai.au')
    const result = robots()
    expect(result.sitemap).toBe('https://www.ethicai.au/sitemap.xml')
    expect(result.rules).toMatchObject({ allow: '/' })
    expect(JSON.stringify(result.rules)).toContain('/admin')
  })
})
