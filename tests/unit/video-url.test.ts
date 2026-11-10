import { describe, expect, it } from 'vitest'

import { parseVideoUrl, youtubeThumbnailUrl } from '@/lib/video-url'

describe('parseVideoUrl', () => {
  it.each([
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtube.com/watch?v=dQw4w9WgXcQ&t=42s',
    'https://m.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ?si=abc123',
    'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    'https://www.youtube.com/live/dQw4w9WgXcQ',
  ])('reads the YouTube video ID from %s', (url) => {
    expect(parseVideoUrl(url)).toEqual({ platform: 'youtube', videoId: 'dQw4w9WgXcQ' })
  })

  it.each([
    'https://www.tiktok.com/@ethicai/video/7234567890123456789',
    'https://www.tiktok.com/@ethicai/video/7234567890123456789?is_from_webapp=1',
    'https://m.tiktok.com/v/7234567890123456789.html',
    'https://www.tiktok.com/embed/v2/7234567890123456789',
  ])('reads the TikTok video ID from %s', (url) => {
    expect(parseVideoUrl(url)).toEqual({ platform: 'tiktok', videoId: '7234567890123456789' })
  })

  it.each([
    '',
    'not a url',
    'https://www.youtube.com/@ethicai',
    'https://www.youtube.com/watch?v=too-short',
    'https://vm.tiktok.com/ZMabc123/',
    'https://www.tiktok.com/@ethicai',
    'https://vimeo.com/123456',
    'javascript:alert(1)',
  ])('rejects %s', (url) => {
    expect(parseVideoUrl(url)).toBeNull()
  })
})

describe('youtubeThumbnailUrl', () => {
  it('uses the i.ytimg.com high-quality thumbnail', () => {
    expect(youtubeThumbnailUrl('dQw4w9WgXcQ')).toBe(
      'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    )
  })
})
