import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
  FieldHook,
  TextField,
  TextFieldSingleValidation,
} from 'payload'
import { slugField } from 'payload'
import { text } from 'payload/shared'

import { adminOnly, publishedOrSignedIn, signedIn } from '@/access'
import { articleEditor } from '@/fields/articleEditor'
import { revalidatePaths } from '@/lib/revalidate'
import { articlePreviewPath, siteUrl, SLUG_PATTERN } from '@/lib/site-url'
import type { Article } from '@/payload-types'

const articlePaths = (slug: string | null | undefined): string[] =>
  slug ? ['/', '/articles', `/articles/${slug}`] : ['/', '/articles']

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

const slug = slugField({
  overrides: (row) => {
    for (const field of row.fields) {
      if ('name' in field && field.name === 'slug') {
        const slugInput = field as TextField
        const validateSlug: TextFieldSingleValidation = (value, options) => {
          if (value && !SLUG_PATTERN.test(value)) {
            return 'Use lowercase letters, numbers and single hyphens only, e.g. "ai-and-hr".'
          }
          return text(value, options)
        }
        slugInput.validate = validateSlug
        slugInput.admin = {
          ...slugInput.admin,
          description: 'The article’s web address: /articles/<slug>. Changing it breaks old links.',
        }
      }
    }
    return row
  },
})

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
            },
          ],
        },
        {
          name: 'seo',
          label: 'SEO',
          description: 'Optional overrides. Leave blank to use the title, excerpt and hero image.',
          fields: [
            { name: 'metaTitle', type: 'text', maxLength: 70 },
            { name: 'metaDescription', type: 'textarea', maxLength: 160 },
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
      admin: { position: 'sidebar' },
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
