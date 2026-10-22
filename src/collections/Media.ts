import type { CollectionConfig } from 'payload'

// Images only. Videos are always embedded from YouTube/TikTok, never uploaded here.
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  admin: {
    description: 'Images only, up to 5 MB each. Videos go on YouTube or TikTok, not here.',
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
  },
}
