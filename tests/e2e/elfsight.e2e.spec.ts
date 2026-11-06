import { expect, type Page, test } from '@playwright/test'

import { gotoHydrated } from '../helpers/navigation'
import { withSiteSettings } from '../helpers/settings'

// Phase 4: the Elfsight TikTok feed loads only on /watch and only after a click (BUILD-SPEC §7.1,
// AGENTS.md #4). Elfsight itself is stubbed: the tests check when we ask for its script, and what
// the page does with the result, without using up real widget views.

const WIDGET_ID = '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d'
const isElfsight = (url: URL) => /(^|\.)elfsight(cdn)?\.com$/.test(url.hostname)

/** Stands in for platform.js: fills each widget container, as the real script does. */
const workingWidget = `
  for (const el of document.querySelectorAll('[class^="elfsight-app-"]')) {
    const feed = document.createElement('div')
    feed.textContent = 'Stub TikTok feed for ' + el.className
    el.append(feed)
  }`

/** Records every request to an Elfsight host and answers it with `script` (or fails it). */
async function stubElfsight(page: Page, script: string | 'fail') {
  const requests: string[] = []
  page.on('request', (request) => {
    if (isElfsight(new URL(request.url()))) requests.push(request.url())
  })
  await page.route(isElfsight, (route) =>
    script === 'fail'
      ? route.abort('connectionfailed')
      : route.fulfill({ contentType: 'text/javascript', body: script }),
  )
  return requests
}

async function expectNoElfsightOnPage(page: Page) {
  await expect(page.locator('[class*="elfsight-app-"]')).toHaveCount(0)
  await expect(page.locator('script[src*="elfsight"]')).toHaveCount(0)
}

test.describe('with a widget ID in site settings', () => {
  test.describe.configure({ mode: 'serial' })

  test('/watch loads the feed after one click and not before', async ({ page }) => {
    await withSiteSettings({ elfsightTikTokWidgetId: WIDGET_ID }, async () => {
      const requests = await stubElfsight(page, workingWidget)
      await gotoHydrated(page, '/watch')

      // Scrolling and moving around the page (Elfsight's own lazy triggers) loads nothing.
      await page.mouse.move(200, 300)
      await page.mouse.wheel(0, 2000)
      await page.keyboard.press('Tab')
      await page.waitForLoadState('networkidle')
      expect(requests).toEqual([])
      await expectNoElfsightOnPage(page)

      const tiktok = page.getByRole('region', { name: 'Latest on TikTok' })
      const button = tiktok.getByRole('button', { name: 'Show latest TikToks' })
      await expect(tiktok.getByRole('link', { name: 'privacy policy' })).toHaveAttribute(
        'href',
        '/privacy-policy',
      )
      await button.click()

      const feed = page.getByRole('region', { name: 'TikTok feed' })
      await expect(feed).toBeFocused()
      await expect(feed.getByText(`Stub TikTok feed for elfsight-app-${WIDGET_ID}`)).toBeVisible()
      await expect(feed).toHaveAttribute('aria-busy', 'false')
      await expect(page.getByRole('status').filter({ hasText: 'TikTok feed loaded.' })).toHaveCount(
        1,
      )
      await expect(button).toHaveCount(0)
      expect(requests).toEqual(['https://elfsightcdn.com/platform.js'])
      await expect(page.locator('script[src="https://elfsightcdn.com/platform.js"]')).toHaveCount(1)
    })
  })

  test('no other page loads Elfsight', async ({ page }) => {
    await withSiteSettings({ elfsightTikTokWidgetId: WIDGET_ID }, async () => {
      const requests = await stubElfsight(page, workingWidget)
      for (const path of [
        '/',
        '/about',
        '/articles',
        '/newsletter',
        '/contact',
        '/privacy-policy',
      ]) {
        await page.goto(path)
        await page.waitForLoadState('networkidle')
        await expectNoElfsightOnPage(page)
      }
      // An article page, if the seed has run.
      await page.goto('/articles')
      const firstArticle = page.locator('main article a[data-card-link]').first()
      if (await firstArticle.count()) {
        await firstArticle.click()
        await page.waitForLoadState('networkidle')
        await expect(page).toHaveURL(/\/articles\/.+/)
        await expectNoElfsightOnPage(page)
      }
      expect(requests).toEqual([])
    })
  })

  test('falls back to the hand-picked videos if Elfsight fails to load', async ({ page }) => {
    await withSiteSettings({ elfsightTikTokWidgetId: WIDGET_ID }, async () => {
      await stubElfsight(page, 'fail')
      await gotoHydrated(page, '/watch')
      await page.getByRole('button', { name: 'Show latest TikToks' }).click()

      const notice = page.getByText('The TikTok feed couldn’t load just now.')
      await expect(notice).toBeFocused()
      await expect(page.locator('[class*="elfsight-app-"]')).toHaveCount(0)
      // Either the curated cards or the short "our videos live on TikTok" note follows it.
      const tiktok = page.getByRole('region', { name: 'Latest on TikTok' })
      await expect(
        tiktok
          .getByRole('link', { name: 'Watch on TikTok' })
          .or(tiktok.getByText('Our short videos live on TikTok.'))
          .first(),
      ).toBeVisible()
    })
  })

  test('gives up after 15 seconds if the feed never appears', async ({ page }) => {
    await withSiteSettings({ elfsightTikTokWidgetId: WIDGET_ID }, async () => {
      // The script loads but renders nothing (e.g. the monthly view limit is used up).
      await stubElfsight(page, '/* renders nothing */')
      await page.clock.install()
      await gotoHydrated(page, '/watch')
      await page.getByRole('button', { name: 'Show latest TikToks' }).click()
      await expect(page.getByRole('region', { name: 'TikTok feed' })).toHaveAttribute(
        'aria-busy',
        'true',
      )

      await page.clock.fastForward(16_000)
      await expect(page.getByText('The TikTok feed couldn’t load just now.')).toBeFocused()
    })
  })
})

test('without a widget ID, /watch shows the hand-picked videos and no facade', async ({ page }) => {
  await withSiteSettings({ elfsightTikTokWidgetId: null }, async () => {
    const requests = await stubElfsight(page, workingWidget)
    await gotoHydrated(page, '/watch')
    await expect(page.getByRole('button', { name: 'Show latest TikToks' })).toHaveCount(0)
    const tiktok = page.getByRole('region', { name: 'Latest on TikTok' })
    await expect(
      tiktok
        .getByRole('link', { name: 'Watch on TikTok' })
        .or(tiktok.getByText('Our short videos live on TikTok.'))
        .first(),
    ).toBeVisible()
    await expectNoElfsightOnPage(page)
    expect(requests).toEqual([])
  })
})
