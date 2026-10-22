import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeValidateHook,
  CollectionConfig,
} from 'payload'
import { ValidationError } from 'payload'

import { adminOnly, anyone, signedIn } from '@/access'
import { revalidatePaths } from '@/lib/revalidate'
import { parseVideoUrl } from '@/lib/video-url'
import type { Video } from '@/payload-types'

// Paste a link → platform and videoId are filled in from it (BUILD-SPEC §4.4, §8), and the same
// video can't be added twice.
const deriveFromUrl: CollectionBeforeValidateHook<Video> = async ({ data, originalDoc, req }) => {
  const url = data?.url ?? originalDoc?.url
  const parsed = parseVideoUrl(url)
  if (!data || !parsed) return data // the url field's own validation reports a bad link

  data.platform = parsed.platform
  data.videoId = parsed.videoId

  const { docs } = await req.payload.find({
    collection: 'videos',
    depth: 0,
    limit: 1,
    pagination: false,
    req,
    where: {
      and: [
        { platform: { equals: parsed.platform } },
        { videoId: { equals: parsed.videoId } },
        ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
      ],
    },
  })
  if (docs[0]) {
    throw new ValidationError({
      collection: 'videos',
      errors: [{ path: 'url', message: `This video has already been added (“${docs[0].title}”).` }],
    })
  }

  return data
}

const revalidateVideo: CollectionAfterChangeHook<Video> = ({ context, doc, req }) => {
  revalidatePaths(req, context, ['/', '/watch'])
  return doc
}

const revalidateDeletedVideo: CollectionAfterDeleteHook<Video> = ({ context, doc, req }) => {
  revalidatePaths(req, context, ['/', '/watch'])
  return doc
}

export const Videos: CollectionConfig = {
  slug: 'videos',
  access: {
    read: anyone,
    create: signedIn,
    update: signedIn,
    delete: adminOnly,
  },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'platform', 'publishedAt', 'featured'],
  },
  defaultSort: '-publishedAt',
  // DECISION: platform and videoId are not marked `required` because they are derived from the
  // URL in a hook; required fields would block the admin form before the hook runs. The url
  // field's validation guarantees both are set, and this index keeps each video unique.
  indexes: [{ fields: ['platform', 'videoId'], unique: true }],
  hooks: {
    beforeValidate: [deriveFromUrl],
    afterChange: [revalidateVideo],
    afterDelete: [revalidateDeletedVideo],
  },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      validate: (value: string | null | undefined) =>
        Boolean(parseVideoUrl(value)) ||
        'Paste a YouTube link or a full TikTok link (https://www.tiktok.com/@handle/video/…).',
      admin: {
        description:
          'The video’s link on YouTube or TikTok. Platform and video ID are filled in automatically when you save.',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
      index: true,
      admin: {
        date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' },
        description: 'The date it went live on YouTube or TikTok.',
      },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Optional. YouTube videos use YouTube’s own thumbnail when this is empty; TikTok videos only appear as cards on the site if a thumbnail is uploaded here.',
      },
    },
    {
      // DECISION: the article ↔ video link is stored once, on the article (`relatedVideo`), and
      // shown here as a read-only join so the two sides can never disagree.
      name: 'articles',
      type: 'join',
      collection: 'articles',
      on: 'relatedVideo',
      admin: {
        description: 'Articles that summarise this video. Set from the article’s “Related video”.',
      },
    },
    {
      name: 'platform',
      type: 'select',
      options: [
        { label: 'YouTube', value: 'youtube' },
        { label: 'TikTok', value: 'tiktok' },
      ],
      admin: { position: 'sidebar', readOnly: true, description: 'Detected from the link.' },
    },
    {
      name: 'videoId',
      type: 'text',
      index: true,
      admin: { position: 'sidebar', readOnly: true, description: 'Detected from the link.' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Featured videos appear on the home page.' },
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'manual',
      options: [
        { label: 'Added by hand', value: 'manual' },
        { label: 'YouTube feed sync', value: 'youtube-rss' },
      ],
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
}
