import { expect, test } from '@playwright/test'
import { getPayload } from 'payload'

import config from '../../src/payload.config'
import { login } from '../helpers/login'
import { createTestUser, deleteTestUser, type TestUser } from '../helpers/users'

// Phase 1 acceptance: an editor can preview a draft article via the preview URL, then publish it.
// Uses an image that already exists (run `npm run seed` first) so the suite never writes to the
// real bucket.

let editor: TestUser

test.beforeAll(async () => {
  editor = await createTestUser('editor', 'article-workflow')
})

test.afterAll(async () => {
  await deleteTestUser(editor.email)
})

const paragraph = (text: string) => ({
  root: {
    type: 'root',
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
    children: [
      {
        type: 'paragraph',
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        version: 1,
        textFormat: 0,
        children: [
          { type: 'text', text, format: 0, style: '', mode: 'normal', detail: 0, version: 1 },
        ],
      },
    ],
  },
})

test('draft → preview → publish', async ({ browser, page, request }) => {
  const payload = await getPayload({ config })
  const { docs: media } = await payload.find({ collection: 'media', depth: 0, limit: 1 })
  test.skip(!media[0], 'Needs at least one image in the media library — run `npm run seed` first')

  const slug = `e2e-workflow-${Date.now()}`
  const title = `E2E workflow ${slug}`
  const article = await payload.create({
    collection: 'articles',
    context: { disableRevalidate: true },
    draft: true,
    data: {
      title,
      slug,
      excerpt: 'Written by the end-to-end test.',
      heroImage: media[0].id,
      content: paragraph('Draft body text from the end-to-end test.'),
      author: editor.id,
      _status: 'draft',
    },
  })

  try {
    // Visitors can't see a draft.
    expect((await request.get(`/articles/${slug}`)).status()).toBe(404)

    // Signed out, the preview route refuses to switch on draft mode.
    expect((await request.get(`/api/preview?slug=${slug}`, { maxRedirects: 0 })).status()).toBe(401)

    // The editor opens the draft from the admin's Preview button.
    await login({ page, user: editor })
    await page.goto(`/admin/collections/articles/${article.id}`)
    const [preview] = await Promise.all([
      page.waitForEvent('popup'),
      page.locator('#preview-button').click(),
    ])
    await preview.waitForLoadState()
    await expect(preview).toHaveURL(new RegExp(`/articles/${slug}$`))
    await expect(preview.getByRole('heading', { level: 1 })).toHaveText(title)
    await expect(preview.getByRole('status')).toContainText('previewing the latest draft')
    await preview.close()

    // Publish from the admin; a fresh visitor now sees it.
    await page.locator('#action-save').click()
    await expect(page.locator('.payload-toast-container')).toContainText(/published|success/i)

    const visitor = await browser.newContext()
    const visitorPage = await visitor.newPage()
    const response = await visitorPage.goto(`/articles/${slug}`)
    expect(response?.status()).toBe(200)
    await expect(visitorPage.getByRole('heading', { level: 1 })).toHaveText(title)
    await expect(visitorPage.getByRole('status')).toHaveCount(0)
    await visitor.close()

    const published = await payload.findByID({ collection: 'articles', id: article.id })
    expect(published._status).toBe('published')
    expect(published.publishedAt).toBeTruthy()
  } finally {
    await payload.delete({
      collection: 'articles',
      id: article.id,
      context: { disableRevalidate: true },
    })
  }
})
