import { readFileSync } from 'node:fs'

import { expect, test } from '@playwright/test'

// After the domain moves, every address from the old Squarespace sitemap answers with a permanent
// redirect (or the page itself) and ends on a working page. Article pages need the Squarespace
// import (scripts/import-squarespace.ts); those are skipped when it hasn't been run.

const oldPaths = readFileSync(
  new URL('../fixtures/squarespace/sitemap-paths.txt', import.meta.url),
  'utf8',
)
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean)

for (const oldPath of oldPaths) {
  test(`${oldPath} ends on a working page`, async ({ request }) => {
    const first = await request.get(oldPath, { maxRedirects: 0 })
    if (first.status() !== 200) {
      expect(first.status(), 'a permanent redirect').toBe(308)
    }
    const final = await request.get(oldPath)
    if (oldPath.startsWith('/insights/') && final.status() === 404) {
      test.skip(true, 'Run scripts/import-squarespace.ts to import the old posts')
    }
    expect(final.status()).toBe(200)
  })
}

test('the old insights RSS feed points to the new one', async ({ request }) => {
  const response = await request.get('/insights?format=rss', { maxRedirects: 0 })
  expect(response.status()).toBe(308)
  expect(response.headers().location).toMatch(/^\/articles\/feed\.xml/)
})
