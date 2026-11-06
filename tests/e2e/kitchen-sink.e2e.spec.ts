import { expect, test } from '@playwright/test'

import { layoutShift, recordLayoutShift } from '../helpers/layout-shift'
import { login } from '../helpers/login'
import { createTestUser, deleteTestUser, type TestUser } from '../helpers/users'
import { gotoHydrated } from '../helpers/navigation'

// Phase 2 acceptance: the kitchen-sink route renders every shared component (BUILD-SPEC §6, §10).

let editor: TestUser

test.beforeAll(async () => {
  editor = await createTestUser('editor', 'kitchen-sink')
})

test.afterAll(async () => {
  await deleteTestUser(editor.email)
})

test('is hidden from visitors', async ({ request }) => {
  expect((await request.get('/kitchen-sink')).status()).toBe(404)
})

test('renders every shared component', async ({ page }) => {
  await login({ page, user: editor })
  await recordLayoutShift(page)
  await page.goto('/kitchen-sink')

  for (const section of [
    'Colours',
    'Typography',
    'Buttons',
    'Section heading',
    'Tag chips',
    'Article cards',
    'Video cards',
    'Click-to-load video (facade)',
    'Prose (article body)',
    'Quote',
    'Pagination',
    'Subscribe call to action (inline)',
    'Social icons',
    'Motion',
  ]) {
    await expect(page.getByRole('heading', { level: 2, name: section })).toBeVisible()
  }

  await expect(page.getByRole('button', { name: 'Primary', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Disabled' })).toBeDisabled()
  await expect(page.locator('figure blockquote')).toHaveCount(1)
  await expect(page.getByRole('complementary', { name: 'Newsletter' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Newsletter' })).toBeVisible()
  await expect(
    page.getByRole('navigation', { name: 'Pagination' }).getByRole('link', { name: 'Page 3' }),
  ).toHaveAttribute('aria-current', 'page')

  expect(await layoutShift(page)).toBeLessThan(0.01)
})

test('video facade loads YouTube only after a click', async ({ page }) => {
  await login({ page, user: editor })
  await gotoHydrated(page, '/kitchen-sink')

  await expect(page.locator('iframe')).toHaveCount(0)
  await page.getByRole('button', { name: 'Play video: Example YouTube video' }).click()
  const player = page.locator('iframe[src*="youtube-nocookie.com/embed/jNQXAC9IVRw"]')
  await expect(player).toHaveAttribute('title', 'Example YouTube video')
  await expect(player).toBeFocused()
})

test('video facade shows a visible focus ring inside its box', async ({ page }) => {
  await login({ page, user: editor })
  await gotoHydrated(page, '/kitchen-sink')
  // The facade's box clips anything drawn outside it, so the ring sits inside, in white.
  await page.keyboard.press('Shift')
  const play = page.getByRole('button', { name: 'Play video: Example YouTube video' })
  await play.focus()
  await expect(play).toBeFocused()
  const ring = await play.evaluate((el) => {
    const style = getComputedStyle(el)
    return { colour: style.outlineColor, offset: style.outlineOffset, width: style.outlineWidth }
  })
  expect(ring).toEqual({ colour: 'rgb(255, 255, 255)', offset: '-6px', width: '3px' })
})
