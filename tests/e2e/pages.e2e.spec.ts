import { expect, test } from '@playwright/test'
import { getPayload } from 'payload'

import config from '../../src/payload.config'

// Phase 3 acceptance: every page renders from seeded/real data (BUILD-SPEC §10).

const pages = [
  ['/', 'AI grounded in human dignity'],
  ['/about', 'About EthicAI'],
  ['/services', 'Services'],
  ['/services/futurefit-diagnostic', 'FutureFit Diagnostic'],
  ['/articles', 'Articles'],
  ['/watch', 'Watch'],
  ['/newsletter', 'The EthicAI newsletter'],
  ['/contact', 'Contact us'],
  ['/privacy-policy', 'Privacy policy'],
] as const

for (const [path, heading] of pages) {
  test(`${path} renders with one h1 and no third-party code`, async ({ page }) => {
    const response = await page.goto(path)
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading)
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.getByRole('contentinfo')).toBeVisible()

    // AGENTS.md #4: nothing third-party loads until the visitor asks for it.
    await expect(page.locator('iframe')).toHaveCount(0)
    const foreignScripts = await page
      .locator('script[src]')
      .evaluateAll((scripts) =>
        scripts
          .map((s) => (s as HTMLScriptElement).src)
          .filter((src) => new URL(src).origin !== location.origin),
      )
    expect(foreignScripts).toEqual([])
  })
}

test('unknown pages get the branded 404 inside the site shell', async ({ page }) => {
  const response = await page.goto('/no-such-page')
  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found')
  await expect(page.getByRole('banner')).toBeVisible()
  await expect(page.getByRole('contentinfo')).toBeVisible()
})

test('a missing article is a 404', async ({ page }) => {
  const response = await page.goto('/articles/no-such-article')
  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found')
})

test('home page shows the spec sections in order', async ({ page }) => {
  await page.goto('/')
  const sections = await page
    .locator('main h2')
    .allTextContents()
    .then((headings) => headings.map((h) => h.trim()))
  const expected = [
    'Why we exist',
    'Ethical AI adoption, from first question to lasting change',
    'Meet Selma.',
    'Latest thinking',
    'Short videos on AI and people',
  ]
  expect(sections.slice(0, expected.length)).toEqual(expected)
  await expect(page.getByRole('link', { name: /Load the TikTok feed/ })).toHaveAttribute(
    'href',
    '/watch',
  )
  await expect(page.getByRole('region', { name: 'Newsletter' })).toBeVisible()
})

test('sitemap lists the static pages and published articles', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text()
  for (const path of ['/about', '/services', '/articles', '/watch', '/newsletter', '/contact']) {
    expect(xml).toContain(`${path}</loc>`)
  }
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'articles',
    limit: 1,
    where: { _status: { equals: 'published' } },
  })
  if (docs[0]) expect(xml).toContain(`/articles/${docs[0].slug}</loc>`)
  expect(xml).not.toContain('/kitchen-sink')
})

test('robots.txt keeps the admin, API and review pages out', async ({ request }) => {
  const robots = await (await request.get('/robots.txt')).text()
  for (const path of ['/admin', '/api/', '/kitchen-sink', '/media-check']) {
    expect(robots).toContain(`Disallow: ${path}`)
  }
  expect(robots).toMatch(/Sitemap: .*\/sitemap\.xml/)
})

test('newsletter page follows the Substack URL in site settings', async ({ page }) => {
  const payload = await getPayload({ config })
  const before = await payload.findGlobal({ slug: 'siteSettings', depth: 0 })
  const ctx = () => ({ disableRevalidate: true })
  try {
    await payload.updateGlobal({
      slug: 'siteSettings',
      context: ctx(),
      data: { substackPublicationUrl: 'https://example.substack.com' },
    })
    await page.goto('/newsletter')
    await expect(page.getByRole('link', { name: 'Subscribe on Substack' }).first()).toHaveAttribute(
      'href',
      'https://example.substack.com/subscribe',
    )
    await expect(page.getByRole('link', { name: 'Read the archive on Substack' })).toHaveAttribute(
      'href',
      'https://example.substack.com/archive',
    )
    // Either real issues or the friendly fallback, never an error.
    await expect(page.getByRole('heading', { name: 'Recent issues' })).toBeVisible()
  } finally {
    await payload.updateGlobal({
      slug: 'siteSettings',
      context: ctx(),
      data: { substackPublicationUrl: before.substackPublicationUrl ?? null },
    })
  }
})

test('home has a slim newsletter strip mid-way and the full band at the end', async ({ page }) => {
  await page.goto('/')
  const strip = page.getByRole('complementary', { name: 'Subscribe to the newsletter' })
  const band = page.getByRole('region', { name: 'Newsletter' })
  await expect(strip.getByRole('link', { name: /^Subscribe/ })).toBeVisible()
  await expect(band.getByRole('link', { name: /^Subscribe/ })).toBeVisible()

  const top = (locator: typeof strip) => locator.boundingBox().then((box) => box!.y)
  const [watch, slim, clients, full] = await Promise.all([
    top(page.getByRole('heading', { name: 'Short videos on AI and people' })),
    top(strip),
    top(page.getByRole('heading', { name: 'What our clients say' })),
    top(band),
  ])
  expect([watch, slim, clients, full]).toEqual([watch, slim, clients, full].sort((a, b) => a - b))
})
