import { expect, type Page, test } from '@playwright/test'

import { gotoHydrated } from '../helpers/navigation'

// The family redesign (docs/REDESIGN-PLAN.md): Selma links, the dark hero and its header, the FAQ,
// reduced motion and the linked structured data.

const SELMA = 'https://selma.au'

test('the family bar, header and footer all link to Selma', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/')

  const familyBar = page.getByRole('complementary', { name: 'The EthicAI family' })
  await expect(familyBar.getByRole('link', { name: 'Selma (opens selma.au)' })).toHaveAttribute(
    'href',
    SELMA,
  )
  await expect(
    page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: /^Selma/ }),
  ).toHaveAttribute('href', SELMA)
  await expect(
    page.getByRole('contentinfo').getByRole('link', { name: 'Selma (opens selma.au)' }),
  ).toHaveAttribute('href', SELMA)

  // Meet Selma on Home links out too.
  const showcase = page.getByRole('region', { name: 'Meet Selma.' })
  await expect(showcase.getByRole('link', { name: /Visit selma\.au/ })).toHaveAttribute(
    'href',
    SELMA,
  )
})

test('the skip link is still the first thing you can tab to', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()
})

const headerColour = (page: Page) =>
  page.locator('.site-header').evaluate((el) => getComputedStyle(el).color)

test('the header is white over the dark hero and ink once the page scrolls', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/')
  await expect.poll(() => headerColour(page)).toBe('rgb(255, 255, 255)')

  await page.evaluate(() => window.scrollTo(0, 1200))
  await expect.poll(() => headerColour(page)).toBe('rgb(29, 29, 31)')
})

test('pages without a dark hero start with the frosted header', async ({ page }) => {
  await page.goto('/no-such-page')
  await expect.poll(() => headerColour(page)).toBe('rgb(29, 29, 31)')
})

test('FAQ answers open from the keyboard', async ({ page }) => {
  await page.goto('/')
  const faq = page.getByRole('region', { name: 'Questions we’re often asked' })
  const first = faq.locator('details').first()
  await expect(first).not.toHaveAttribute('open')
  await first.locator('summary').focus()
  await page.keyboard.press('Enter')
  await expect(first).toHaveAttribute('open')
  await expect(first.locator('p')).toBeVisible()
})

test('reduced motion turns the animations off', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto('/')
  const animations = await page.evaluate(() => ({
    aurora: getComputedStyle(document.querySelector('.aurora')!, '::before').animationName,
    headline: getComputedStyle(document.querySelector('h1')!).animationName,
    ring: getComputedStyle(document.querySelector('.rings-animated .ring')!).animationName,
  }))
  expect(animations).toEqual({ aurora: 'none', headline: 'none', ring: 'none' })
  await context.close()
})

type Node = Record<string, unknown>

async function structuredData(page: Page): Promise<Node[]> {
  return page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((scripts) => scripts.flatMap((s) => [JSON.parse(s.textContent ?? 'null')].flat()))
}

/** Every `{ "@id": … }` reference anywhere in the records. */
function references(value: unknown, found: string[] = []): string[] {
  if (Array.isArray(value)) value.forEach((v) => references(v, found))
  else if (value && typeof value === 'object') {
    const record = value as Node
    const keys = Object.keys(record)
    if (typeof record['@id'] === 'string' && !('@type' in record) && keys.length <= 2) {
      found.push(record['@id'])
    }
    Object.values(record).forEach((v) => references(v, found))
  }
  return found
}

for (const path of ['/', '/about', '/services', '/services/consulting', '/watch', '/contact']) {
  test(`structured data on ${path} is linked, with no reference to a missing record`, async ({
    page,
  }) => {
    await page.goto(path)
    const nodes = await structuredData(page)
    const types = nodes.map((node) => node['@type'])
    expect(types).toEqual(expect.arrayContaining(['Organization', 'WebSite', 'Product']))

    const defined = new Set(nodes.map((node) => node['@id']).filter(Boolean))
    // The Selma product id belongs to selma.au, but it is also described on every page here.
    const missing = references(nodes).filter((id) => !defined.has(id))
    expect(missing).toEqual([])

    const organisation = nodes.find((node) => node['@type'] === 'Organization')!
    expect(organisation.owns).toEqual({ '@id': 'https://selma.au/#product' })
  })
}

test('the About page describes each team member as a Person', async ({ page }) => {
  await page.goto('/about')
  const people = (await structuredData(page)).filter((node) => node['@type'] === 'Person')
  const kara = people.find((person) => person.name === 'Kara Bombell' && person.hasCredential)
  test.skip(!kara, 'Needs the seeded team')
  expect(kara?.worksFor).toEqual({ '@id': expect.stringMatching(/#organization$/) })
})

test('the Home FAQ is given to search engines exactly as shown', async ({ page }) => {
  await gotoHydrated(page, '/')
  const faq = (await structuredData(page)).find((node) => node['@type'] === 'FAQPage')
  const visible = await page
    .getByRole('region', { name: 'Questions we’re often asked' })
    .locator('summary h3')
    .allTextContents()
  const listed = (faq?.mainEntity as Array<{ name: string }>).map((q) => q.name)
  expect(listed).toEqual(visible.map((q) => q.trim()))
})
