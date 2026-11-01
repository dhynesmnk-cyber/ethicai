import { expect, test } from '@playwright/test'

import {
  anyMediaId,
  anyUserId,
  createArticle,
  createVideo,
  deleteArticles,
  deleteVideos,
} from '../helpers/content'

// Phase 3: the Watch page (TikTok first, curated YouTube grid) and the home page's watch strip.

test('videos appear on Watch and in the home strip', async ({ page }) => {
  const [thumbnail, author] = await Promise.all([anyMediaId(), anyUserId()])
  test.skip(!thumbnail || !author, 'Run `npm run seed` first')

  const stamp = Date.now()
  const youtube = await createVideo({
    url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
    title: `E2E YouTube ${stamp}`,
    publishedAt: '2026-10-20',
    featured: true,
  })
  const tiktok = await createVideo({
    url: `https://www.tiktok.com/@ethicai/video/7${String(stamp).padStart(18, '0')}`,
    title: `E2E TikTok ${stamp}`,
    publishedAt: '2026-10-19',
    thumbnail: thumbnail!,
  })
  const tiktokNoThumb = await createVideo({
    url: `https://www.tiktok.com/@ethicai/video/8${String(stamp).padStart(18, '0')}`,
    title: `E2E TikTok without thumbnail ${stamp}`,
    publishedAt: '2026-10-18',
  })
  const summary = await createArticle({
    title: `E2E summary ${stamp}`,
    slug: `e2e-summary-${stamp}`,
    heroImage: thumbnail!,
    author: author!,
    relatedVideo: youtube.id,
  })

  try {
    await page.goto('/watch')
    const sections = await page.locator('main section h2').allTextContents()
    expect(sections.map((s) => s.trim())).toEqual(['Latest on TikTok', 'Videos on YouTube'])

    const tiktokSection = page.getByRole('region', { name: 'Latest on TikTok' })
    await expect(tiktokSection.getByText(tiktok.title)).toBeVisible()
    await expect(
      tiktokSection.getByRole('link', { name: 'Watch on TikTok' }).first(),
    ).toHaveAttribute('href', tiktok.url)
    // TikTok videos without a thumbnail stay off the page (BUILD-SPEC §4.4).
    await expect(page.getByText(tiktokNoThumb.title)).toHaveCount(0)

    const youtubeSection = page.getByRole('region', { name: 'Videos on YouTube' })
    await expect(youtubeSection.getByText(youtube.title)).toBeVisible()
    await expect(
      youtubeSection.getByRole('link', { name: 'Read the summary' }).first(),
    ).toHaveAttribute('href', `/articles/${summary.slug}`)
    await expect(page.locator('iframe')).toHaveCount(0)

    await page.goto('/')
    const strip = page.getByRole('region', { name: 'Featured videos' })
    await expect(strip).toHaveAttribute('tabindex', '0')
    await expect(strip.getByText(youtube.title)).toBeVisible()
  } finally {
    await deleteArticles([summary.id])
    await deleteVideos([youtube.id, tiktok.id, tiktokNoThumb.id])
  }
})
