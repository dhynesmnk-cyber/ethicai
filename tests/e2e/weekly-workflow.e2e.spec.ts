import { expect, type Page, test } from '@playwright/test'
import { getPayload } from 'payload'

import config from '../../src/payload.config'
import { anyMediaId } from '../helpers/content'
import { login } from '../helpers/login'
import { createTestUser, deleteTestUser, type TestUser } from '../helpers/users'

// Phase 5 acceptance (BUILD-SPEC §10): an editor completes the whole weekly workflow in the admin
// — add the video, write the article linked to it, publish — and a visitor sees the result. The
// spec allows ten minutes; the test records how long the clicking takes and fails if it's slow.
// Uses an image that already exists (run `npm run seed` first) so the suite never writes to the
// real bucket.

const YOUTUBE_URL = 'https://www.youtube.com/watch?v=jNQXAC9IVRw'
const MAX_MINUTES = 10

let editor: TestUser

test.beforeAll(async () => {
  editor = await createTestUser('editor', 'weekly-workflow')
})

test.afterAll(async () => {
  await deleteTestUser(editor.email)
})

const toast = (page: Page) => page.locator('.payload-toast-container')

const markdownBody = [
  '## What we learned this week',
  '',
  'People adopt AI **faster** when they help shape the change.',
  '',
  '- Start with the people affected',
  '- Say what will not change',
  '',
  '> Tools follow trust.',
].join('\n')

test('an editor adds a video, writes a linked article, publishes it, and visitors see it', async ({
  browser,
  page,
}) => {
  test.skip(
    !(await anyMediaId()),
    'Needs at least one image in the media library — run `npm run seed` first',
  )

  const stamp = Date.now()
  const videoTitle = `Weekly video ${stamp}`
  const articleTitle = `Weekly article ${stamp}`
  const started = Date.now()
  const payload = await getPayload({ config })

  try {
    await login({ page, user: editor })

    // 1. Dashboard → New video.
    await page
      .getByRole('region', { name: 'This week' })
      .getByRole('link', { name: 'New video' })
      .click()
    await expect(page).toHaveURL(/\/admin\/collections\/videos\/create$/)

    // 2. Paste the link; the date it went live; save.
    await page.locator('#field-url').fill(YOUTUBE_URL)
    await page.locator('#field-title').fill(videoTitle)
    const wentLive = page.locator('#field-publishedAt input').first()
    await wentLive.fill('12 Nov 2026')
    await wentLive.press('Enter')
    await page.locator('#action-save').click()
    await expect(page).toHaveURL(/\/admin\/collections\/videos\/\d+$/)
    await expect(toast(page)).toContainText(/successfully/i)
    // The platform and video ID were filled in from the link.
    await expect(page.locator('#field-videoId')).toHaveValue('jNQXAC9IVRw')

    // 3. Dashboard → New article: title, excerpt, hero image from the library.
    await page.goto('/admin')
    await page
      .getByRole('region', { name: 'This week' })
      .getByRole('link', { name: 'New article' })
      .click()
    await expect(page).toHaveURL(/\/admin\/collections\/articles\/create$/)
    await page.locator('#field-title').fill(articleTitle)
    await page
      .locator('#field-excerpt')
      .fill('What we learned from this week’s video about people-led AI change.')

    await page.getByRole('button', { name: 'Choose from existing' }).click()
    const drawer = page.locator('.list-drawer')
    await expect(drawer).toBeVisible()
    await drawer.locator('tbody tr').first().locator('button').first().click()
    await expect(drawer).toBeHidden()

    // 4. Paste the draft as Markdown.
    const body = page.locator('.rich-text-lexical [contenteditable="true"]').first()
    await body.click()
    await body.evaluate((element, text) => {
      const data = new DataTransfer()
      data.setData('text/plain', text)
      element.dispatchEvent(
        new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }),
      )
    }, markdownBody)
    await expect(
      body.getByRole('heading', { level: 2, name: 'What we learned this week' }),
    ).toBeVisible()

    // 5. Link the video, found by typing its title.
    const related = page.locator('#field-relatedVideo')
    await related.click()
    await related.locator('input').fill(videoTitle)
    await page.getByRole('option', { name: videoTitle }).click()

    // The web address fills itself in a few seconds after the title (autosave generates it), and
    // publishing before then is refused. Editors see it appear; the test waits for it too.
    await expect(page.getByRole('textbox', { name: 'Slug' })).not.toHaveValue('', {
      timeout: 15_000,
    })

    // 6. Publish.
    await page.locator('#action-save').click()
    await expect(page).toHaveURL(/\/admin\/collections\/articles\/\d+$/, { timeout: 30_000 })
    await expect(toast(page)).toContainText(/success|published/i)

    const minutes = (Date.now() - started) / 60_000
    console.log(`Weekly workflow completed in the admin in ${(minutes * 60).toFixed(0)} seconds`)
    expect(minutes).toBeLessThan(MAX_MINUTES)

    // 7. A visitor sees the article everywhere it should be.
    const visitor = await browser.newContext()
    const site = await visitor.newPage()
    try {
      await site.goto('/')
      await expect(site.getByRole('link', { name: articleTitle }).first()).toBeVisible()

      await site.goto('/articles')
      await site.getByRole('link', { name: articleTitle }).first().click()
      await expect(site.getByRole('heading', { level: 1, name: articleTitle })).toBeVisible()
      await expect(
        site.getByRole('heading', { level: 2, name: 'What we learned this week' }),
      ).toBeVisible()
      await expect(site.locator('strong', { hasText: 'faster' })).toBeVisible()
      await expect(
        site.getByRole('listitem').filter({ hasText: 'Start with the people affected' }),
      ).toBeVisible()
      await expect(site.getByRole('heading', { name: 'Watch the original video' })).toBeVisible()

      await site.goto('/watch')
      const card = site.getByRole('region', { name: 'Videos on YouTube' }).getByText(videoTitle)
      await expect(card).toBeVisible()
      await expect(site.getByRole('link', { name: 'Read the summary' }).first()).toHaveAttribute(
        'href',
        /\/articles\/weekly-article-\d+$/,
      )
    } finally {
      await visitor.close()
    }
  } finally {
    for (const collection of ['articles', 'videos'] as const) {
      const { docs } = await payload.find({
        collection,
        depth: 0,
        pagination: false,
        where: { title: { in: [articleTitle, videoTitle] } },
      })
      for (const doc of docs) {
        await payload.delete({ collection, id: doc.id, context: { disableRevalidate: true } })
      }
    }
  }
})
