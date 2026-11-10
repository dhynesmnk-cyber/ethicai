import { expect, test } from '@playwright/test'

import { login } from '../helpers/login'
import { createTestUser, deleteTestUser, type TestUser } from '../helpers/users'
import { withSiteSettings } from '../helpers/settings'

// The TikTok handle is used to build a link on /watch, so it is validated when saved and encoded
// when rendered.

let admin: TestUser

test.beforeAll(async () => {
  admin = await createTestUser('admin', 'tiktok-handle')
})

test.afterAll(async () => {
  await deleteTestUser(admin.email)
})

test('Site settings only accepts a real TikTok handle', async ({ page }) => {
  await login({ page, user: admin })
  const current = await (await page.request.get('/api/globals/siteSettings')).json()
  const save = (data: Record<string, unknown>) =>
    page.request.post('/api/globals/siteSettings', { data })

  try {
    for (const bad of ['not a handle!', '@a/b', '@', 'x'.repeat(30), '<script>']) {
      expect((await save({ tiktokHandle: bad })).status(), `"${bad}" should be refused`).toBe(400)
    }
    for (const good of ['@ethicai', 'ethicai', '@eth.ic_ai9']) {
      expect((await save({ tiktokHandle: good })).status(), `"${good}" should be accepted`).toBe(
        200,
      )
    }
  } finally {
    await save({ tiktokHandle: current.tiktokHandle ?? null })
  }
})

test('/watch links to the profile for the saved handle', async ({ page }) => {
  await withSiteSettings({ tiktokHandle: '@ethicai' }, async () => {
    await page.goto('/watch')
    await expect(page.getByRole('link', { name: 'Follow @ethicai on TikTok' })).toHaveAttribute(
      'href',
      'https://www.tiktok.com/@ethicai',
    )
  })
})
