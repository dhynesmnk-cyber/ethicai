import { expect, test } from '@playwright/test'

test('home page renders with a skip link and one h1', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/EthicAI/)
  await expect(page.locator('h1')).toHaveCount(1)
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeAttached()
})

test('admin is reachable and asks for credentials', async ({ page }) => {
  await page.goto('/admin')
  // Redirects to /admin/create-first-user on an empty database, otherwise /admin/login.
  await expect(page).toHaveURL(/\/admin\/(login|create-first-user)/)
  await expect(page.locator('#field-email')).toBeVisible()
})
