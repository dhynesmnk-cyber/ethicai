// Parses YouTube and TikTok links into { platform, videoId } (BUILD-SPEC §4.4, §7.3).
// The maintainer pastes whatever link the platform's share button gives, so accept the common shapes.

export type VideoPlatform = 'youtube' | 'tiktok'

export type ParsedVideoUrl = {
  platform: VideoPlatform
  videoId: string
}

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/
const TIKTOK_ID = /^\d{15,21}$/
const YOUTUBE_HOSTS = new Set(['youtube.com', 'm.youtube.com', 'music.youtube.com'])

export function parseVideoUrl(input: string | null | undefined): ParsedVideoUrl | null {
  if (!input) return null

  let url: URL
  try {
    url = new URL(input.trim())
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null

  const host = url.hostname.toLowerCase().replace(/^www\./, '')
  const segments = url.pathname.split('/').filter(Boolean)

  if (host === 'youtu.be') {
    return youtube(segments[0])
  }

  if (YOUTUBE_HOSTS.has(host) || host === 'youtube-nocookie.com') {
    if (segments[0] === 'watch') return youtube(url.searchParams.get('v'))
    if (['shorts', 'embed', 'live', 'v'].includes(segments[0] ?? '')) return youtube(segments[1])
    return null
  }

  if (host === 'tiktok.com' || host === 'm.tiktok.com') {
    // https://www.tiktok.com/@handle/video/7234567890123456789
    if (segments[0]?.startsWith('@') && segments[1] === 'video') return tiktok(segments[2])
    // https://www.tiktok.com/embed/v2/7234567890123456789 and https://m.tiktok.com/v/7234….html
    if (segments[0] === 'embed') return tiktok(segments[1] === 'v2' ? segments[2] : segments[1])
    if (segments[0] === 'v') return tiktok(segments[1]?.replace(/\.html$/, ''))
    return null
  }

  return null
}

export function youtubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
}

function youtube(id: string | null | undefined): ParsedVideoUrl | null {
  return id && YOUTUBE_ID.test(id) ? { platform: 'youtube', videoId: id } : null
}

function tiktok(id: string | null | undefined): ParsedVideoUrl | null {
  return id && TIKTOK_ID.test(id) ? { platform: 'tiktok', videoId: id } : null
}
