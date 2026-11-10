import { describe, expect, it } from 'vitest'

import { indexNowBody, indexNowEnabled, indexNowKey } from '@/lib/indexnow'

describe('IndexNow', () => {
  it('accepts only keys IndexNow allows', () => {
    expect(indexNowKey('a1b2c3d4e5f6')).toBe('a1b2c3d4e5f6')
    expect(indexNowKey('short')).toBeNull()
    expect(indexNowKey('has spaces in it')).toBeNull()
    expect(indexNowKey(undefined)).toBeNull()
  })

  it('is only on for the real public site with a key', () => {
    expect(indexNowEnabled('https://ethicai.au', 'a1b2c3d4e5f6')).toBe(true)
    expect(indexNowEnabled('https://ethicai.au', null)).toBe(false)
    expect(indexNowEnabled('https://ethicaiau1.netlify.app', 'a1b2c3d4e5f6')).toBe(false)
    expect(indexNowEnabled('http://localhost:3000', 'a1b2c3d4e5f6')).toBe(false)
  })

  it('sends page URLs only, once each, with the key location', () => {
    expect(
      indexNowBody(
        ['/', '/articles', '/articles/a', '/articles', '/articles/feed.xml', '/llms.txt'],
        'https://ethicai.au',
        'a1b2c3d4e5f6',
      ),
    ).toEqual({
      host: 'ethicai.au',
      key: 'a1b2c3d4e5f6',
      keyLocation: 'https://ethicai.au/indexnow-key.txt',
      urlList: [
        'https://ethicai.au/',
        'https://ethicai.au/articles',
        'https://ethicai.au/articles/a',
      ],
    })
  })
})
