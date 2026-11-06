import { expect, type Page, test } from '@playwright/test'
import { getPayload } from 'payload'

import config from '../../src/payload.config'
import { anyMediaId, createArticle, deleteArticles } from '../helpers/content'
import { login } from '../helpers/login'
import { createTestUser, deleteTestUser, type TestUser } from '../helpers/users'

// Phase 5: the "This week" panel at the top of the admin dashboard (BUILD-SPEC §8).
// Uses an image that already exists (run `npm run seed` first).

let editor: TestUser
let admin: TestUser
const articleIds: number[] = []

test.beforeAll(async () => {
  editor = await createTestUser('editor', 'dashboard-editor')
  admin = await createTestUser('admin', 'dashboard-admin')
})

test.afterAll(async () => {
  await deleteArticles(articleIds)
  await deleteTestUser(editor.email)
  await deleteTestUser(admin.email)
})

const panel = (page: Page) => page.getByRole('region', { name: 'This week' })
const draftsWaiting = async (page: Page) => {
  await page.goto('/admin')
  await expect(panel(page)).toBeVisible()
  return Number(await panel(page).locator('.this-week__figure').innerText())
}

for (const role of ['editor', 'admin'] as const) {
  test(`${role}: the panel shows the weekly actions and checklist`, async ({ page }) => {
    await login({ page, user: role === 'editor' ? editor : admin })
    await page.goto('/admin')

    await expect(panel(page)).toBeVisible()
    await expect(
      panel(page).getByRole('heading', { name: 'Weekly publishing checklist' }),
    ).toBeVisible()
    await expect(panel(page).getByRole('listitem')).toHaveCount(4)

    await panel(page).getByRole('link', { name: 'New article' }).click()
    await expect(page).toHaveURL(/\/admin\/collections\/articles\/create$/)

    await page.goto('/admin')
    await panel(page).getByRole('link', { name: 'New video' }).click()
    await expect(page).toHaveURL(/\/admin\/collections\/videos\/create$/)
  })
}

test('the draft count follows drafts, including edits waiting on a published article', async ({
  page,
}) => {
  const heroImage = await anyMediaId()
  test.skip(!heroImage, 'Needs at least one image in the media library — run `npm run seed` first')
  const payload = await getPayload({ config })

  await login({ page, user: editor })
  const before = await draftsWaiting(page)

  // A new draft counts.
  const draft = await createArticle({
    title: `Dashboard draft ${Date.now()}`,
    slug: `e2e-dashboard-draft-${Date.now()}`,
    heroImage: heroImage!,
    author: editor.id,
    _status: 'draft',
  })
  articleIds.push(draft.id)
  expect(await draftsWaiting(page)).toBe(before + 1)

  // Publishing it takes it off the list.
  await payload.update({
    collection: 'articles',
    id: draft.id,
    data: { _status: 'published' },
    context: { disableRevalidate: true },
  })
  expect(await draftsWaiting(page)).toBe(before)

  // Unpublished edits to a live article count as a draft again.
  await payload.update({
    collection: 'articles',
    id: draft.id,
    draft: true,
    data: { excerpt: 'An edit that has not been published.' },
    context: { disableRevalidate: true },
  })
  expect(await draftsWaiting(page)).toBe(before + 1)
})

test('it shows the latest published article and how long ago it went live', async ({ page }) => {
  const heroImage = await anyMediaId()
  test.skip(!heroImage, 'Needs at least one image in the media library — run `npm run seed` first')

  const title = `Dashboard latest ${Date.now()}`
  const article = await createArticle({
    title,
    slug: `e2e-dashboard-latest-${Date.now()}`,
    heroImage: heroImage!,
    author: editor.id,
    publishedAt: new Date(Date.now() + 60_000).toISOString(), // newest of all
  })
  articleIds.push(article.id)

  await login({ page, user: editor })
  await page.goto('/admin')
  await expect(panel(page).getByText(title)).toBeVisible()
  await expect(panel(page).getByRole('link', { name: 'Edit' })).toHaveAttribute(
    'href',
    `/admin/collections/articles/${article.id}`,
  )
  await expect(panel(page).getByRole('link', { name: 'View on the site' })).toHaveAttribute(
    'href',
    `/articles/${article.slug}`,
  )
  // Dated a minute ahead, so the panel flags the date instead of saying "published today".
  await expect(panel(page).getByText('Dated in the future. Check its publish date.')).toBeVisible()
})
