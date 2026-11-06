import { expect, test } from '@playwright/test'

// Phase 4: the on-demand revalidation endpoint for changes made outside the running site.
// Publishing itself revalidates through Payload hooks; see src/app/api/revalidate/route.ts.

const secret = process.env.REVALIDATE_SECRET

test('/api/revalidate needs the shared secret', async ({ request }) => {
  const anonymous = await request.post('/api/revalidate')
  if (!secret) {
    expect(anonymous.status(), 'switched off without REVALIDATE_SECRET').toBe(404)
    return
  }
  expect(anonymous.status()).toBe(401)
  const wrong = await request.post('/api/revalidate', {
    headers: { Authorization: 'Bearer not-the-secret' },
  })
  expect(wrong.status()).toBe(401)

  const auth = { Authorization: `Bearer ${secret}` }
  const some = await request.post('/api/revalidate', {
    headers: auth,
    data: { paths: ['/', '/articles'] },
  })
  expect(some.status()).toBe(200)
  expect(await some.json()).toEqual({ revalidated: ['/', '/articles'] })

  const all = await request.post('/api/revalidate', { headers: auth })
  expect(await all.json()).toEqual({ revalidated: 'all' })

  const bad = await request.post('/api/revalidate', {
    headers: auth,
    data: { paths: ['https://example.com/'] },
  })
  expect(bad.status()).toBe(400)
})
