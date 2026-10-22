import type { CollectionConfig, ImageSize } from 'payload'

import { adminOnly, anyone, signedIn } from '@/access'
import { publicFileURL, readS3PublicUrl } from '@/lib/storage'

// Images only. Videos are always embedded from YouTube/TikTok, never uploaded here.
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

const webpSize = (name: string, width: number): ImageSize => ({
  name,
  width,
  // Keeps the aspect ratio; images narrower than `width` are not upscaled.
  withoutEnlargement: true,
  formatOptions: { format: 'webp', options: { quality: 80 } },
})

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: anyone,
    create: signedIn,
    update: signedIn,
    delete: adminOnly,
  },
  admin: {
    group: 'Content',
    description: 'Images only, up to 5 MB each. Videos go on YouTube or TikTok, not here.',
    defaultColumns: ['filename', 'alt', 'updatedAt'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description:
          'Describe the image for people using screen readers, e.g. "Kara presenting at a workshop".',
      },
    },
  ],
  upload: {
    // DECISION: raster formats only rather than image/*. SVGs can carry scripts, and next/image
    // refuses to optimise them by default.
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'],
    // WebP renditions; the original upload is kept as the fallback (BUILD-SPEC §4.2).
    imageSizes: [webpSize('thumbnail', 480), webpSize('card', 960), webpSize('hero', 1920)],
    // Payload builds thumbnailURL as /api/media/file/<name>, a local-disk route that ignores the
    // storage adapter's public URLs, so point admin thumbnails at the bucket like every other URL.
    adminThumbnail: ({ doc }) => {
      const sizes = doc.sizes as { thumbnail?: { filename?: string | null } } | undefined
      const filename = sizes?.thumbnail?.filename || doc.filename
      if (typeof filename !== 'string' || !filename) return null
      const folder = [doc.prefix, doc._objectKey]
        .filter((part): part is string => typeof part === 'string' && part.length > 0)
        .join('/')
      return publicFileURL(readS3PublicUrl(), filename, folder || undefined)
    },
    focalPoint: true,
  },
}
