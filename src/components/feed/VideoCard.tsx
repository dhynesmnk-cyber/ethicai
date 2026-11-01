import Image from 'next/image'
import Link from 'next/link'

import { YouTubeFacade } from '@/components/feed/YouTubeFacade'
import { ArrowRightIcon, ExternalIcon } from '@/components/icons'
import { Card } from '@/components/ui/Card'
import { formatDate } from '@/lib/format'
import type { ImageData } from '@/lib/media'

type Props = {
  platform: 'youtube' | 'tiktok'
  videoId: string
  url: string
  title: string
  publishedAt: string
  thumbnail?: ImageData | null
  /** Link to the article that summarises this video. */
  summaryHref?: string
  headingLevel?: 'h2' | 'h3'
}

/** Video card: YouTube plays in place (click-to-load); TikTok links out to the video. */
export function VideoCard({
  platform,
  videoId,
  url,
  title,
  publishedAt,
  thumbnail,
  summaryHref,
  headingLevel: Heading = 'h3',
}: Props) {
  return (
    <Card>
      {platform === 'youtube' ? (
        <YouTubeFacade videoId={videoId} title={title} thumbnail={thumbnail} />
      ) : (
        <div className="relative aspect-video overflow-hidden bg-ink">
          {thumbnail && (
            <Image
              src={thumbnail.url}
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, 100vw"
              className="object-cover"
            />
          )}
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-5 sm:p-6">
        <p className="text-sm font-medium text-accent">
          {platform === 'youtube' ? 'YouTube' : 'TikTok'}
        </p>
        <Heading className="text-xl">{title}</Heading>
        <p className="text-sm text-muted">
          <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
        </p>
        <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-2 font-medium">
          {platform === 'tiktok' && (
            <a
              href={url}
              className="inline-flex items-center gap-1.5 text-accent hover:text-accent-strong"
            >
              Watch on TikTok
              <ExternalIcon className="size-4" />
            </a>
          )}
          {summaryHref && (
            <Link
              href={summaryHref}
              className="inline-flex items-center gap-1.5 text-accent hover:text-accent-strong"
            >
              Read the summary
              <ArrowRightIcon className="size-4" />
            </Link>
          )}
        </div>
      </div>
    </Card>
  )
}
