import { expect, test } from '@playwright/test'
import { getPayload } from 'payload'
import sharp from 'sharp'

import config from '../../src/payload.config'
import { login } from '../helpers/login'

// Writes to the real bucket, so it only runs when asked: E2E_MEDIA_UPLOAD=1 npm run test:e2e
// Proves the Phase 0 acceptance criterion end to end: admin upload → object in S3/R2 →
// rendered by next/image on /media-check → deleted from the bucket with the document.
test.skip(!process.env.E2E_MEDIA_UPLOAD, 'Set E2E_MEDIA_UPLOAD=1 to run against the real bucket')

const testUser = {
  email: 'e2e-media@example.com',
  password: 'e2e-media-upload-only',
}

test('admin upload lands in object storage and renders', async ({ page, request }) => {
  const payload = await getPayload({ config })
  await payload.delete({ collection: 'users', where: { email: { equals: testUser.email } } })
  await payload.create({ collection: 'users', data: testUser })

  let mediaId: number | undefined
  try {
    await login({ page, user: testUser })

    const filename = `e2e-upload-${Date.now()}.jpg`
    const image = await sharp({
      create: { width: 640, height: 400, channels: 3, background: '#1F6F5C' },
    })
      .jpeg()
      .toBuffer()

    await page.goto('/admin/collections/media/create')
    await page.locator('input[type="file"]').setInputFiles({
      name: filename,
      mimeType: 'image/jpeg',
      buffer: image,
    })
    await page.locator('#field-alt').fill('Plain green test rectangle')
    await page.locator('#action-save').click()
    await page.waitForURL(/\/admin\/collections\/media\/\d+/)
    mediaId = Number(page.url().split('/').pop())

    const doc = await payload.findByID({ collection: 'media', id: mediaId })
    const publicUrl = (process.env.S3_PUBLIC_URL ?? '').replace(/\/+$/, '')
    expect(doc.url).toBe(`${publicUrl}/${filename}`)

    const object = await request.get(doc.url as string)
    expect(object.status()).toBe(200)
    expect(object.headers()['content-type']).toContain('image/jpeg')

    await page.goto('/media-check')
    const rendered = page.getByRole('img', { name: 'Plain green test rectangle' }).first()
    await expect(rendered).toBeVisible()
    await expect
      .poll(() => rendered.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth))
      .toBeGreaterThan(0)

    await payload.delete({ collection: 'media', id: mediaId })
    mediaId = undefined
    await expect.poll(async () => (await request.get(doc.url as string)).status()).toBe(404)
  } finally {
    if (mediaId !== undefined) await payload.delete({ collection: 'media', id: mediaId })
    await payload.delete({ collection: 'users', where: { email: { equals: testUser.email } } })
  }
})
