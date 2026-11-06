import { expect, type Page, test } from '@playwright/test'

import {
  anyMediaId,
  createArticle,
  deleteArticles,
  deleteVideos,
  lexicalParagraph,
} from '../helpers/content'
import { login } from '../helpers/login'
import { createTestUser, deleteTestUser, type TestUser } from '../helpers/users'

// Phase 4 acceptance: publishing refreshes Home and the listing "within seconds"
// (BUILD-SPEC §10). This can only be shown on a production build, because `next dev` never caches.
//
//   npm run build && npx next start          (leave it running on port 3000)
//   E2E_REVALIDATION=1 npm run test:e2e -- tests/e2e/revalidation-cache.e2e.spec.ts
//
// The endpoint's own rules are covered in revalidate.e2e.spec.ts.

const SECRET = process.env.REVALIDATE_SECRET
const POLL = { timeout: 15_000, intervals: [250, 500, 1000] }

test.describe('publishing refreshes the cached pages', () => {
  test.skip(
    !process.env.E2E_REVALIDATION,
    'Needs a production build: npm run build && npx next start, then E2E_REVALIDATION=1',
  )

  let admin: TestUser
  const articleIds: number[] = []
  const videoIds: number[] = []

  test.beforeAll(async () => {
    admin = await createTestUser('admin', 'revalidation-cache')
  })

  test.afterAll(async () => {
    await deleteArticles(articleIds)
    await deleteVideos(videoIds)
    await deleteTestUser(admin.email)
  })

  const html = (page: Page, path: string) => page.request.get(path).then((r) => r.text())
  const currentUserId = (page: Page) =>
    page.request
      .get('/api/users/me')
      .then((r) => r.json())
      .then((body) => body.user.id as number)

  test('publishing and deleting an article refreshes Home and the listing within seconds', async ({
    page,
  }) => {
    await login({ page, user: admin })
    const title = `Revalidation check ${Date.now()}`
    const heroImage = await anyMediaId()
    expect(heroImage, 'Run `npm run seed` first').toBeTruthy()

    // Warm the cache, so the pages below really are served from it.
    await html(page, '/')
    await html(page, '/articles')

    // Published through the running site's API, so the collection hooks run in the server.
    const created = await page.request.post('/api/articles', {
      data: {
        title,
        slug: `e2e-revalidation-${Date.now()}`,
        excerpt: 'Written by the revalidation test.',
        heroImage,
        author: await currentUserId(page),
        content: lexicalParagraph('Revalidation test body.'),
        _status: 'published',
      },
    })
    expect(created.status()).toBe(201)
    const article = (await created.json()).doc as { id: number; slug: string }
    articleIds.push(article.id)

    const status = (path: string) => page.request.get(path).then((r) => r.status())
    await expect.poll(() => html(page, '/'), POLL).toContain(title)
    await expect.poll(() => html(page, '/articles'), POLL).toContain(title)
    await expect.poll(() => status(`/articles/${article.slug}`), POLL).toBe(200)

    expect((await page.request.delete(`/api/articles/${article.id}`)).status()).toBe(200)
    await expect.poll(() => html(page, '/'), POLL).not.toContain(title)
    await expect.poll(() => html(page, '/articles'), POLL).not.toContain(title)
    await expect.poll(() => status(`/articles/${article.slug}`), POLL).toBe(404)
  })

  test('publishing a featured video refreshes the Home strip', async ({ page }) => {
    await login({ page, user: admin })
    const title = `Featured video check ${Date.now()}`
    await html(page, '/')

    const created = await page.request.post('/api/videos', {
      data: {
        url: 'https://youtu.be/jNQXAC9IVRw',
        title,
        publishedAt: new Date().toISOString(),
        featured: true,
      },
    })
    expect(created.status()).toBe(201)
    const id = (await created.json()).doc.id as number
    videoIds.push(id)

    await expect.poll(() => html(page, '/'), POLL).toContain(title)
    expect((await page.request.delete(`/api/videos/${id}`)).status()).toBe(200)
    await expect.poll(() => html(page, '/'), POLL).not.toContain(title)
  })

  test('without the hooks Home stays cached, and /api/revalidate refreshes it', async ({
    page,
  }) => {
    test.skip(!SECRET, 'Needs REVALIDATE_SECRET in .env')
    await login({ page, user: admin })
    const title = `Cache proof ${Date.now()}`
    const heroImage = await anyMediaId()
    expect(heroImage, 'Run `npm run seed` first').toBeTruthy()
    await html(page, '/')

    // Written straight through the Local API with revalidation switched off, as a script would.
    const article = await createArticle({
      title,
      slug: `e2e-cache-proof-${Date.now()}`,
      heroImage: heroImage!,
      author: await currentUserId(page),
    })
    articleIds.push(article.id)

    // The cache really is serving Home: the new article isn't there yet, however long we wait.
    await page.waitForTimeout(3000)
    expect(await html(page, '/')).not.toContain(title)

    const refreshed = await page.request.post('/api/revalidate', {
      headers: { Authorization: `Bearer ${SECRET}` },
      data: { paths: ['/'] },
    })
    expect(refreshed.status()).toBe(200)
    await expect.poll(() => html(page, '/'), POLL).toContain(title)
  })
})
