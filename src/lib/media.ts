import type { Media } from '@/payload-types'

export type ImageData = { url: string; alt: string; width: number; height: number }

/**
 * Picks an image rendition for next/image. Falls back to the original upload when the size
 * wasn't generated, and returns null for unpopulated relationships.
 */
export function toImage(
  media: Media | number | null | undefined,
  size?: 'thumbnail' | 'card' | 'hero',
): ImageData | null {
  if (!media || typeof media === 'number') return null
  const rendition = size ? media.sizes?.[size] : undefined
  const url = rendition?.url ?? media.url
  const width = rendition?.width ?? media.width
  const height = rendition?.height ?? media.height
  if (!url || !width || !height) return null
  return { url, alt: media.alt, width, height }
}
