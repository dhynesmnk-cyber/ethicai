import { expect, test } from '@playwright/test'
import { gotoHydrated } from '../helpers/navigation'

import {
  anyMediaId,
  anyUserId,
  createArticle,
  createVideo,
  deleteArticles,
  deleteVideos,
} from '../helpers/content'

// Phase 3: articles listing (search, tags, pagination) and detail (BUILD-SPEC §5.4).
// Needs the seed (`npm run seed`) for images, an author and the two demo articles.

const WHY = 'demo-why-ethical-ai-starts-with-people'
const FIVE = 'demo-five-questions-before-adopting-an-ai-tool'

test.describe('articles listing', () => {
  test('searches titles and excerpts', async ({ page }) => {
    await page.goto('/articles')
    await page.getByRole('searchbox', { name: 'Search articles' }).fill('checklist')
    await page.getByRole('button', { name: 'Search' }).click()
    await expect(page).toHaveURL(/\/articles\?q=checklist/)
    await expect(page.getByRole('link', { name: /Five questions to ask/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /Why ethical AI starts/ })).toHaveCount(0)
  })

  test('shows a friendly empty state', async ({ page }) => {
    await page.goto('/articles?q=zzzz-no-match')
    await expect(page.getByRole('heading', { name: 'No articles match that search' })).toBeVisible()
  })

  test('filters by tag', async ({ page }) => {
    await page.goto('/articles')
    const filters = page.getByRole('navigation', { name: 'Filter by tag' })
    await expect(filters.getByRole('link', { name: 'All' })).toHaveAttribute('aria-current', 'true')
    await filters.getByRole('link', { name: 'People & culture' }).click()
    await expect(page).toHaveURL(/tag=People/)
    await expect(filters.getByRole('link', { name: 'People & culture' })).toHaveAttribute(
      'aria-current',
      'true',
    )
    await expect(page.getByRole('link', { name: /Why ethical AI starts/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /Five questions to ask/ })).toHaveCount(0)
  })

  test('paginates nine to a page', async ({ page }) => {
    const [heroImage, author] = await Promise.all([anyMediaId(), anyUserId()])
    test.skip(!heroImage || !author, 'Run `npm run seed` first')
    const ids: number[] = []
    try {
      for (let i = 1; i <= 10; i++) {
        const article = await createArticle({
          title: `Pagination check ${String(i).padStart(2, '0')}`,
          slug: `e2e-pagination-${i}-${Date.now()}`,
          heroImage: heroImage!,
          author: author!,
          tags: ['E2E pagination'],
          publishedAt: new Date(Date.UTC(2020, 0, i)).toISOString(),
        })
        ids.push(article.id)
      }
      await page.goto('/articles?tag=E2E%20pagination')
      await expect(page.getByText('10 articles tagged “E2E pagination”.')).toBeVisible()
      await expect(page.locator('main article')).toHaveCount(9)
      await page
        .getByRole('navigation', { name: 'Pagination' })
        .getByRole('link', { name: 'Next page' })
        .click()
      await expect(page).toHaveURL(/page=2/)
      await expect(page.locator('main article')).toHaveCount(1)
      expect((await page.goto('/articles?tag=E2E%20pagination&page=3'))?.status()).toBe(404)
    } finally {
      await deleteArticles(ids)
    }
  })
})

test.describe('article page', () => {
  test('shows the meta row, related and adjacent articles, and structured data', async ({
    page,
  }) => {
    const response = await page.goto(`/articles/${WHY}`)
    test.skip(response?.status() === 404, 'Run `npm run seed` first')

    const header = page.locator('article header')
    await expect(header).toContainText('By ')
    await expect(header).toContainText('8 October 2026')
    await expect(header).toContainText('min read')
    await expect(header.getByRole('link', { name: 'People & culture' })).toHaveAttribute(
      'href',
      '/articles?tag=People%20%26%20culture',
    )

    // Both demo articles share the "Demo" tag; the other one is newer.
    await expect(
      page
        .getByRole('region', { name: 'Related articles' })
        .getByRole('link', { name: /Five questions/ }),
    ).toBeVisible()
    await expect(
      page.getByRole('navigation', { name: 'More articles' }).getByRole('link', { name: /Newer/ }),
    ).toHaveAttribute('href', `/articles/${FIVE}`)

    const schemas = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((scripts) =>
        scripts.flatMap((s) => [JSON.parse(s.textContent ?? 'null')].flat()),
      )
    const types = schemas.map((schema: { '@type': string }) => schema['@type'])
    expect(types).toEqual(expect.arrayContaining(['Organization', 'Article', 'BreadcrumbList']))

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      new RegExp(`/articles/${WHY}$`),
    )
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      /opengraph-image/,
    )
  })

  test('embeds the related video behind a click-to-load facade', async ({ page }) => {
    const [heroImage, author] = await Promise.all([anyMediaId(), anyUserId()])
    test.skip(!heroImage || !author, 'Run `npm run seed` first')
    const video = await createVideo({
      url: 'https://youtu.be/jNQXAC9IVRw',
      title: 'E2E related video',
      publishedAt: '2026-10-01',
    })
    const article = await createArticle({
      title: 'E2E article with video',
      slug: `e2e-with-video-${Date.now()}`,
      heroImage: heroImage!,
      author: author!,
      relatedVideo: video.id,
    })
    try {
      await gotoHydrated(page, `/articles/${article.slug}`)
      await expect(page.getByRole('heading', { name: 'Watch the original video' })).toBeVisible()
      await expect(page.locator('iframe')).toHaveCount(0)
      await page.getByRole('button', { name: 'Play video: E2E related video' }).click()
      await expect(
        page.locator('iframe[src*="youtube-nocookie.com/embed/jNQXAC9IVRw"]'),
      ).toBeVisible()

      const types = await page
        .locator('script[type="application/ld+json"]')
        .evaluateAll((scripts) =>
          scripts
            .flatMap((s) => [JSON.parse(s.textContent ?? 'null')].flat())
            .map((x) => x['@type']),
        )
      expect(types).toContain('VideoObject')
    } finally {
      await deleteArticles([article.id])
      await deleteVideos([video.id])
    }
  })

  test('copies the article link', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    const response = await gotoHydrated(page, `/articles/${WHY}`)
    test.skip(response?.status() === 404, 'Run `npm run seed` first')
    await page.getByRole('button', { name: 'Copy link' }).click()
    await expect(page.getByRole('status')).toHaveText('Link copied')
    expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(
      new RegExp(`/articles/${WHY}$`),
    )
  })
})
