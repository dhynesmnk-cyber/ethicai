import { expect, test } from '@playwright/test'
import { getPayload } from 'payload'

import config from '../../src/payload.config'
import { layoutShift, recordLayoutShift } from '../helpers/layout-shift'

// Phase 2 acceptance: header/footer shell responsive 320px → 1440px, accessible mobile nav,
// no layout shift from fonts or images (BUILD-SPEC §10).

test('has landmarks, one h1 and a working skip link', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('banner')).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeAttached()
  await expect(page.getByRole('main')).toBeVisible()
  await expect(page.getByRole('contentinfo')).toBeVisible()
  await expect(page.locator('h1')).toHaveCount(1)

  await page.keyboard.press('Tab')
  const skip = page.getByRole('link', { name: 'Skip to content' })
  await expect(skip).toBeFocused()
  await expect(skip).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page.locator('main')).toBeFocused()
})

for (const width of [320, 375, 768, 1024, 1440]) {
  test(`no horizontal scrolling at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })
}

test('mobile menu is an accessible disclosure', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 })
  await page.goto('/')
  const toggle = page.getByRole('button', { name: 'Menu' })
  const menu = page.locator('#mobile-menu')

  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(menu).toBeHidden()

  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect(menu.getByRole('link', { name: 'Articles' })).toBeVisible()

  // Escape closes it and returns focus to the button.
  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  await expect(toggle).toBeFocused()

  // Works from the keyboard alone, and links follow the button in tab order.
  await page.keyboard.press('Enter')
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('Tab')
  await expect(menu.getByRole('link', { name: 'About' })).toBeFocused()
})

test('desktop shows every nav link inline', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Menu' })).toBeHidden()
  const nav = page.getByRole('navigation', { name: 'Main' })
  for (const label of ['About', 'Articles', 'Watch', 'Newsletter', 'Contact', 'Subscribe']) {
    await expect(nav.getByRole('link', { name: label })).toBeVisible()
  }
})

test('marks the current section in the nav', async ({ page }) => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'articles',
    limit: 1,
    where: { _status: { equals: 'published' } },
  })
  test.skip(!docs[0], 'Needs a published article — run `npm run seed` first')

  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto(`/articles/${docs[0].slug}`)
  const nav = page.getByRole('navigation', { name: 'Main' })
  await expect(nav.getByRole('link', { name: 'Articles' })).toHaveAttribute('aria-current', 'true')
  await expect(nav.getByRole('link', { name: 'About' })).not.toHaveAttribute('aria-current')
})

test('fonts and images cause no layout shift', async ({ page }) => {
  await recordLayoutShift(page)
  await page.goto('/')
  expect(await layoutShift(page)).toBeLessThan(0.01)
})
