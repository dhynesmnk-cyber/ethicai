import Image from 'next/image'

import { cn } from '@/lib/cn'
import type { Photo as PhotoData } from '@/lib/photography'

type Props = {
  photo: PhotoData
  className?: string
  sizes?: string
  loading?: 'eager' | 'lazy'
  fetchPriority?: 'high' | 'low' | 'auto'
}

/**
 * A photograph filling its (positioned) parent, cropped around the photo's focal point. Always a
 * background behind text, so it's decorative to screen readers (alt=""); /photo-credits
 * describes each one.
 */
// On phones the photo is cropped to a tall box, so it renders wider than the screen (about 1.7–2
// times on an inner page); asking for 100vw there made phones download a small image and stretch
// it. 150vw lands on the 1200 px rendition on a typical phone: sharp, and about 100 KB as AVIF.
const DEFAULT_SIZES = '(max-width: 640px) 150vw, 100vw'

export function Photo({ photo, className, sizes = DEFAULT_SIZES, loading, fetchPriority }: Props) {
  const bundled = typeof photo.src !== 'string'
  return (
    <Image
      src={photo.src}
      alt=""
      fill
      sizes={sizes}
      // Always under a dark fade, where 60 looks the same as 75 and the file is about a third smaller.
      quality={60}
      loading={loading}
      fetchPriority={fetchPriority}
      // Bundled photos carry a tiny blurred preview, so the space never flashes empty.
      placeholder={bundled ? 'blur' : 'empty'}
      className={cn('object-cover', className)}
      style={{ objectPosition: photo.position ?? 'center' }}
    />
  )
}
