import { afterEach, describe, expect, it, vi } from 'vitest'

import robots from '@/app/robots'
import { isReviewSite } from '@/lib/site-url'

// robots.txt reads the AI crawler policy from Site settings; no database in unit tests.
vi.mock('@/lib/site-settings', () => ({
  getSiteSettings: async () => ({ search: { aiCrawlers: 'allow-all' } }),
}))

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
  it('blocks every crawler on a review site, and lists no sitemap', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://ethicaiau.netlify.app')
    expect(await robots()).toEqual({ rules: { userAgent: '*', disallow: '/' } })
  })

  it('allows the public site but keeps the admin and API out', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://ethicai.au')
    const result = await robots()
    expect(result.sitemap).toBe('https://ethicai.au/sitemap.xml')
    expect([result.rules].flat()[0]).toMatchObject({ userAgent: '*', allow: '/' })
    expect(JSON.stringify(result.rules)).toContain('/admin')
  })
})
