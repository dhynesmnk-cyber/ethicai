import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
  FieldHook,
} from 'payload'

import { adminOnly, publishedOrSignedIn, signedIn } from '@/access'
import { articleEditor } from '@/fields/articleEditor'
import { urlSlugField } from '@/fields/slug'
import { revalidatePaths } from '@/lib/revalidate'
import { articlePreviewPath, siteUrl } from '@/lib/site-url'
import type { Article } from '@/payload-types'

const articlePaths = (slug: string | null | undefined): string[] =>
  slug
    ? ['/', '/articles', `/articles/${slug}`, '/articles/feed.xml', '/llms.txt', '/llms-full.txt']
    : ['/', '/articles', '/articles/feed.xml', '/llms.txt', '/llms-full.txt']

const revalidateArticle: CollectionAfterChangeHook<Article> = ({
  context,
  doc,
  previousDoc,
  req,
}) => {
  const paths: string[] = []
  if (doc._status === 'published') paths.push(...articlePaths(doc.slug))

  // Unpublished, or published under a new slug: refresh the old URL so it stops serving.
  const wasPublished = previousDoc?._status === 'published'
  if (wasPublished && (doc._status !== 'published' || previousDoc.slug !== doc.slug)) {
    paths.push(...articlePaths(previousDoc.slug))
  }

  if (paths.length > 0) revalidatePaths(req, context, paths)
  return doc
}

const revalidateDeletedArticle: CollectionAfterDeleteHook<Article> = ({ context, doc, req }) => {
  revalidatePaths(req, context, articlePaths(doc?.slug))
  return doc
}

// The listing orders by publishedAt, so a published article must always have one.
const setPublishedAt: FieldHook<Article> = ({ siblingData, value }) => {
  if (siblingData._status === 'published' && !value) return new Date().toISOString()
  return value
}

const slug = urlSlugField(
  'The article’s web address: /articles/<slug>. It fills in by itself a few seconds after you type the title (wait for it before publishing). Changing it breaks old links.',
)

export const Articles: CollectionConfig = {
  slug: 'articles',
  access: {
    read: publishedOrSignedIn,
    create: signedIn,
    update: signedIn,
    delete: adminOnly,
  },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', '_status', 'publishedAt', 'author'],
    listSearchableFields: ['title', 'excerpt'],
    preview: (doc) =>
      typeof doc.slug === 'string' ? `${siteUrl()}${articlePreviewPath(doc.slug)}` : null,
    livePreview: {
      url: ({ data }) =>
        typeof data.slug === 'string' ? `${siteUrl()}${articlePreviewPath(data.slug)}` : null,
    },
  },
  defaultSort: '-publishedAt',
  indexes: [{ fields: ['_status', 'publishedAt'] }],
  versions: {
    drafts: {
      autosave: { interval: 1500 },
    },
    maxPerDoc: 50,
  },
  hooks: {
    afterChange: [revalidateArticle],
    afterDelete: [revalidateDeletedArticle],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description:
          'The headline, shown on the article, on cards and when the link is shared. The web address is made from it automatically.',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'excerpt',
              type: 'textarea',
              required: true,
              maxLength: 300,
              admin: {
                description:
                  'One or two sentences (300 characters max). Used on article cards, in search results and when the link is shared.',
              },
            },
            {
              name: 'keyTakeaways',
              type: 'array',
              maxRows: 5,
              labels: { singular: 'Takeaway', plural: 'Key takeaways' },
              admin: {
                description:
                  'Optional: up to five one-sentence points, shown first as “In short”. Search engines and AI assistants often quote these, so make each one stand on its own.',
              },
              fields: [
                {
                  name: 'point',
                  type: 'text',
                  required: true,
                  maxLength: 200,
                  admin: { description: 'One complete sentence (200 characters max).' },
                },
              ],
            },
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
              required: true,
              admin: { description: 'Landscape image, ideally 16:9.' },
            },
            {
              name: 'content',
              type: 'richText',
              required: true,
              editor: articleEditor,
              admin: {
                description:
                  'Use Heading 2 and Heading 3 to break up the text. You can paste Markdown and it converts as you paste. The YouTube block adds an extra video.',
              },
            },
          ],
        },
        {
          name: 'seo',
          label: 'SEO',
          description: 'Optional overrides. Leave blank to use the title, excerpt and hero image.',
          fields: [
            {
              name: 'metaTitle',
              type: 'text',
              maxLength: 70,
              admin: {
                description:
                  'Replaces the title in search results and social shares (70 characters max). Leave blank to use the article title.',
              },
            },
            {
              name: 'metaDescription',
              type: 'textarea',
              maxLength: 160,
              admin: {
                description:
                  'Replaces the excerpt in search results (160 characters max). Leave blank to use the excerpt.',
              },
            },
            {
              name: 'ogImage',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Image shown when the article is shared on social media.' },
            },
          ],
        },
      ],
    },
    slug,
    {
      name: 'publishedAt',
      type: 'date',
      index: true,
      defaultValue: () => new Date().toISOString(),
      hooks: { beforeChange: [setPublishedAt] },
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime', displayFormat: 'd MMM yyyy, h:mm a' },
        description: 'Articles are listed newest first by this date.',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      defaultValue: ({ user }) => user?.id,
      admin: {
        position: 'sidebar',
        description: 'Who wrote it. Defaults to you, and is shown on the article.',
      },
    },
    {
      name: 'relatedVideo',
      type: 'relationship',
      relationTo: 'videos',
      admin: {
        position: 'sidebar',
        description: 'The video this article summarises. Shown as “Watch the original video”.',
      },
    },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
      admin: {
        position: 'sidebar',
        description: 'Press Enter after each tag, e.g. “AI policy”, “Change management”.',
      },
    },
  ],
}
