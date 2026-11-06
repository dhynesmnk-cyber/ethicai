import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeDeleteHook,
  CollectionBeforeValidateHook,
  CollectionConfig,
  PayloadRequest,
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

// A video's title and thumbnail also appear on the published articles that link to it, so those
// pages need refreshing too (otherwise they'd show the old title for up to an hour).
async function linkedArticlePaths(req: PayloadRequest, videoId: number): Promise<string[]> {
  const { docs } = await req.payload.find({
    collection: 'articles',
    depth: 0,
    limit: 100,
    pagination: false,
    req,
    select: { slug: true },
    where: { and: [{ relatedVideo: { equals: videoId } }, { _status: { equals: 'published' } }] },
  })
  return docs.flatMap((article) => (article.slug ? [`/articles/${article.slug}`] : []))
}

const revalidateVideo: CollectionAfterChangeHook<Video> = async ({ context, doc, req }) => {
  if (context.disableRevalidate) return doc
  revalidatePaths(req, context, ['/', '/watch', ...(await linkedArticlePaths(req, doc.id))])
  return doc
}

// Deleting a video clears the link on its articles, so their paths must be found beforehand.
// DECISION: handed from beforeDelete to afterDelete through a WeakMap keyed by the request, not
// through `context`: Payload gives the two delete hooks different context objects, so a value set
// in one never reached the other (seen on a production build: the article stayed stale).
const articlesLinkedAtDelete = new WeakMap<PayloadRequest, string[]>()

const rememberLinkedArticles: CollectionBeforeDeleteHook = async ({ context, id, req }) => {
  if (context.disableRevalidate) return
  articlesLinkedAtDelete.set(req, await linkedArticlePaths(req, Number(id)))
}

const revalidateDeletedVideo: CollectionAfterDeleteHook<Video> = ({ context, doc, req }) => {
  revalidatePaths(req, context, ['/', '/watch', ...(articlesLinkedAtDelete.get(req) ?? [])])
  articlesLinkedAtDelete.delete(req)
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
    beforeDelete: [rememberLinkedArticles],
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
      admin: {
        description: 'Shown on the video’s card. Usually the same as on YouTube or TikTok.',
      },
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
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Whether someone added this entry or the automatic YouTube sync did.',
      },
    },
  ],
}
