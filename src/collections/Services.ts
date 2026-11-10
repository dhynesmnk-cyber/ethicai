import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
} from 'payload'

import { adminOnly, publishedFlagOrSignedIn } from '@/access'
import { articleEditor } from '@/fields/articleEditor'
import { urlSlugField } from '@/fields/slug'
import { revalidatePaths } from '@/lib/revalidate'
import type { Service } from '@/payload-types'

// What EthicAI offers (docs/REDESIGN-PLAN.md §4): listed at /services, each with its own page at
// /services/<slug>. Old Squarespace pages (/futurefit, /academy, /publicsector …) redirect here.

const servicePaths = (slug: string | null | undefined): string[] =>
  slug ? ['/', '/services', `/services/${slug}`, '/llms.txt'] : ['/', '/services', '/llms.txt']

const revalidateService: CollectionAfterChangeHook<Service> = ({
  context,
  doc,
  previousDoc,
  req,
}) => {
  const paths = servicePaths(doc.slug)
  if (previousDoc?.slug && previousDoc.slug !== doc.slug)
    paths.push(...servicePaths(previousDoc.slug))
  revalidatePaths(req, context, paths)
  return doc
}

const revalidateDeletedService: CollectionAfterDeleteHook<Service> = ({ context, doc, req }) => {
  revalidatePaths(req, context, servicePaths(doc?.slug))
  return doc
}

export const Services: CollectionConfig = {
  slug: 'services',
  access: {
    read: publishedFlagOrSignedIn,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  admin: {
    group: 'Site',
    useAsTitle: 'title',
    defaultColumns: ['title', 'order', 'published'],
    description: 'What EthicAI offers. Each service has its own page under /services.',
  },
  defaultSort: 'order',
  hooks: {
    afterChange: [revalidateService],
    afterDelete: [revalidateDeletedService],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: { description: 'The service’s name, e.g. “FutureFit Diagnostic”.' },
    },
    urlSlugField(
      'The service’s web address: /services/<slug>. It fills in from the title when you first save. Changing it breaks old links.',
    ),
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      maxLength: 240,
      admin: {
        description:
          'One or two sentences (240 characters max): what it is and who it’s for. Used on the service cards and in search results.',
      },
    },
    {
      name: 'body',
      type: 'richText',
      required: true,
      editor: articleEditor,
      admin: {
        description:
          'The full description. Use Heading 2 for sections such as “Why it matters” and “How we help”. Markdown pastes convert as you paste.',
      },
    },
    {
      name: 'faq',
      label: 'FAQ',
      type: 'array',
      labels: { singular: 'Question', plural: 'Questions' },
      admin: {
        description:
          'Optional questions and answers at the end of the page. Start each answer with the answer itself.',
      },
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
          admin: { description: 'Phrase it the way a client would ask it.' },
        },
        {
          name: 'answer',
          type: 'textarea',
          required: true,
          admin: { description: 'Two or three plain sentences.' },
        },
      ],
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
      admin: { position: 'sidebar', description: 'Only published services appear on the site.' },
    },
  ],
}
