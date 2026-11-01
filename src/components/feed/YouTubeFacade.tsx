import Image from 'next/image'

import { Facade } from '@/components/ui/Facade'
import type { ImageData } from '@/lib/media'
import { youtubeThumbnailUrl } from '@/lib/video-url'

type Props = {
  videoId: string
  title: string
  /** An uploaded thumbnail; YouTube's own is used otherwise. */
  thumbnail?: ImageData | null
  sizes?: string
}

/** YouTube player that loads from youtube-nocookie.com only after the visitor presses play. */
export function YouTubeFacade({
  videoId,
  title,
  thumbnail,
  sizes = '(min-width: 1024px) 33vw, 100vw',
}: Props) {
  return (
    <Facade
      label={`Play video: ${title}`}
      iframeTitle={title}
      embedSrc={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
    >
      <Image
        src={thumbnail?.url ?? youtubeThumbnailUrl(videoId)}
        alt=""
        fill
        sizes={sizes}
        className="object-cover opacity-90 transition-opacity group-hover:opacity-100"
      />
    </Facade>
  )
}
