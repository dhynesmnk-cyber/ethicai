import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
} from 'payload'

import { adminOnly, publishedFlagOrSignedIn } from '@/access'
import { revalidatePaths } from '@/lib/revalidate'
import { parseVideoUrl } from '@/lib/video-url'
import type { Testimonial } from '@/payload-types'

const revalidateTestimonial: CollectionAfterChangeHook<Testimonial> = ({ context, doc, req }) => {
  revalidatePaths(req, context, ['/'])
  return doc
}

const revalidateDeletedTestimonial: CollectionAfterDeleteHook<Testimonial> = ({
  context,
  doc,
  req,
}) => {
  revalidatePaths(req, context, ['/'])
  return doc
}

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  access: {
    read: publishedFlagOrSignedIn,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  admin: {
    group: 'Site',
    useAsTitle: 'attribution',
    defaultColumns: ['attribution', 'organisation', 'order', 'published'],
  },
  defaultSort: 'order',
  hooks: {
    afterChange: [revalidateTestimonial],
    afterDelete: [revalidateDeletedTestimonial],
  },
  fields: [
    { name: 'quote', type: 'textarea', required: true },
    {
      name: 'attribution',
      type: 'text',
      required: true,
      admin: { description: 'Who said it, e.g. “Deputy Ombudsman”.' },
    },
    { name: 'organisation', type: 'text' },
    {
      // DECISION: a link rather than a relationship to `videos`, so a testimonial video doesn't
      // also appear in the public video feed on /watch.
      name: 'featuredVideo',
      type: 'text',
      label: 'Featured video link',
      validate: (value: string | null | undefined) =>
        !value || Boolean(parseVideoUrl(value)) || 'Paste a YouTube or TikTok link.',
      admin: {
        description:
          'Optional YouTube or TikTok link (an unlisted YouTube video is fine) shown with the quote.',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Lower numbers appear first.' },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Only published testimonials appear on the site.',
      },
    },
  ],
}
