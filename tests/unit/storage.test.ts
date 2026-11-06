import { describe, expect, it } from 'vitest'

import { publicFileURL, readS3Settings } from '@/lib/storage'

const completeEnv = {
  S3_BUCKET: 'ethicai-media',
  S3_ENDPOINT: 'https://account.r2.cloudflarestorage.com',
  S3_ACCESS_KEY_ID: 'key',
  S3_SECRET_ACCESS_KEY: 'secret',
  S3_PUBLIC_URL: 'https://media.example.com/',
}

describe('readS3Settings', () => {
  it('defaults the region to auto and trims the public URL', () => {
    const settings = readS3Settings(completeEnv)
    expect(settings.region).toBe('auto')
    expect(settings.publicUrl).toBe('https://media.example.com')
  })

  it('drops a bucket path copied from the Cloudflare dashboard endpoint', () => {
    const settings = readS3Settings({
      ...completeEnv,
      S3_ENDPOINT: 'https://account.r2.cloudflarestorage.com/ethicai-media',
    })
    expect(settings.endpoint).toBe('https://account.r2.cloudflarestorage.com')
  })

  it('refuses to start without storage settings instead of falling back to local disk', () => {
    expect(() =>
      readS3Settings({ ...completeEnv, S3_BUCKET: '', S3_SECRET_ACCESS_KEY: '' }),
    ).toThrow('missing S3_BUCKET, S3_SECRET_ACCESS_KEY')
  })
})

describe('publicFileURL', () => {
  it('encodes the filename and includes an optional prefix', () => {
    expect(publicFileURL('https://media.example.com', 'team photo.jpg')).toBe(
      'https://media.example.com/team%20photo.jpg',
    )
    expect(publicFileURL('https://media.example.com/', 'a.png', '/uploads/')).toBe(
      'https://media.example.com/uploads/a.png',
    )
  })
})
