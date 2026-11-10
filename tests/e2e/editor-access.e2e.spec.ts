import { expect, test } from '@playwright/test'
import { getPayload } from 'payload'

import config from '../../src/payload.config'
import { login } from '../helpers/login'
import { createTestUser, deleteTestUser, type TestUser } from '../helpers/users'

// Phase 1 acceptance: the editor role cannot reach users or siteSettings (BUILD-SPEC §4.1).

let editor: TestUser

test.beforeAll(async () => {
  editor = await createTestUser('editor', 'editor-access')
})

test.afterAll(async () => {
  await deleteTestUser(editor.email)
})

test('editors cannot reach users or site settings in the admin', async ({ page }) => {
  await login({ page, user: editor })

  const nav = page.locator('nav')
  await expect(nav.getByRole('link', { name: 'Articles' })).toBeVisible()
  await expect(nav.getByRole('link', { name: 'Users' })).toHaveCount(0)
  await expect(nav.getByRole('link', { name: 'Site settings' })).toHaveCount(0)

  await page.goto('/admin/collections/users')
  await expect(page.locator('#field-email, .collection-list')).toHaveCount(0)

  await page.goto('/admin/globals/siteSettings')
  await expect(page.locator('#field-elfsightTikTokWidgetId')).toHaveCount(0)
})

test('editors cannot read or change users and site settings through the API', async ({ page }) => {
  await login({ page, user: editor })

  const users = await (await page.request.get('/api/users?depth=0')).json()
  expect(users.docs.map((user: { email: string }) => user.email)).toEqual([editor.email])

  expect((await page.request.get('/api/globals/siteSettings')).status()).toBe(403)
  const settingsUpdate = await page.request.post('/api/globals/siteSettings', {
    data: { contactEmail: 'hijack@example.com' },
  })
  expect(settingsUpdate.status()).toBe(403)

  const createUser = await page.request.post('/api/users', {
    data: { name: 'Nope', email: 'nope@example.com', password: 'nope-nope-nope', role: 'admin' },
  })
  expect(createUser.status()).toBe(403)

  // Editors may edit their own account but can't promote themselves.
  await page.request.patch(`/api/users/${editor.id}`, { data: { role: 'admin' } })
  const payload = await getPayload({ config })
  const self = await payload.findByID({ collection: 'users', id: editor.id })
  expect(self.role).toBe('editor')
})
