import type { ComponentProps } from 'react'

import type { VideoCard } from '@/components/feed/VideoCard'
import { toImage } from '@/lib/media'
import type { Video } from '@/payload-types'

/** Card props for a video, linking to the article that summarises it when there is one. */
export function videoCardProps(video: Video): ComponentProps<typeof VideoCard> {
  const article = video.articles?.docs?.find((doc) => typeof doc === 'object')
  return {
    platform: video.platform === 'tiktok' ? 'tiktok' : 'youtube',
    videoId: video.videoId ?? '',
    url: video.url,
    title: video.title,
    publishedAt: video.publishedAt,
    thumbnail: toImage(video.thumbnail, 'card'),
    summaryHref: article && typeof article === 'object' ? `/articles/${article.slug}` : undefined,
  }
}

/** TikTok videos only appear as cards when a thumbnail was uploaded (BUILD-SPEC §4.4). */
export function isDisplayableVideo(video: Video): boolean {
  if (!video.videoId) return false
  return video.platform === 'youtube' || Boolean(video.thumbnail)
}

/** Stable in-page anchor for a team member on /about, e.g. "kara-bombell". */
export function teamMemberAnchor(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
