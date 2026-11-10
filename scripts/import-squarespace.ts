// Brings the posts from the old Squarespace site (ethicai.au/insights) into Articles, with their
// original web addresses, publish dates and header images, so the old /insights/<slug> links can
// redirect to /articles/<slug> after the domain moves (src/lib/redirects.ts).
//
// Run it once, against production, BEFORE the domain cutover (it reads the live Squarespace site):
//   npx payload run scripts/import-squarespace.ts
// Optional: SQUARESPACE_URL=https://www.ethicai.au (the default).
//
// Safe to run again: posts whose slug already exists are skipped, and nothing is overwritten.
// Authors are matched to users by name, or through a user's linked team profile; create (or link)
// accounts for the authors first, otherwise the post goes under the first admin and the script
// says so. After it finishes, refresh the cached pages once: POST /api/revalidate.

import config from '@payload-config'
import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { getPayload } from 'payload'

import { articleEditorFeatures } from '@/fields/articleEditor'
import { htmlToMarkdown, plainText, truncate } from '@/lib/html-to-markdown'
import { SLUG_PATTERN } from '@/lib/site-url'

type SquarespaceItem = {
  urlId: string
  title: string
  body: string
  excerpt?: string
  assetUrl?: string
  publishOn: number
  tags?: string[]
  categories?: string[]
  author?: { displayName?: string }
}

const SOURCE = (process.env.SQUARESPACE_URL || 'https://www.ethicai.au').replace(/\/+$/, '')
// A fresh object per call: the storage plugin leaves a flag on a shared context object.
const context = () => ({ disableRevalidate: true })

const payload = await getPayload({ config })
const log = (message: string) => payload.logger.info(`import: ${message}`)
const warn = (message: string) => payload.logger.warn(`import: ${message}`)

const response = await fetch(`${SOURCE}/insights?format=json`, {
  headers: { 'User-Agent': 'EthicAI site import' },
})
if (!response.ok) throw new Error(`Couldn’t read ${SOURCE}/insights (HTTP ${response.status}).`)
const { items = [] } = (await response.json()) as { items?: SquarespaceItem[] }
log(`found ${items.length} posts on ${SOURCE}/insights`)

const editorConfig = await editorConfigFactory.fromFeatures({
  config: payload.config,
  features: articleEditorFeatures,
})

const { docs: users } = await payload.find({
  collection: 'users',
  depth: 1,
  limit: 100,
  sort: 'createdAt',
})
const fallbackAuthor = users.find((user) => user.role === 'admin')
if (!fallbackAuthor) throw new Error('No admin user found. Create one at /admin first.')

function authorFor(name: string | undefined) {
  if (name) {
    const match = users.find(
      (user) =>
        user.name === name || (typeof user.profile === 'object' && user.profile?.name === name),
    )
    if (match) return match
    warn(
      `no user for author “${name}”: using ${fallbackAuthor!.name}. Fix the byline in the admin.`,
    )
  }
  return fallbackAuthor!
}

async function importHeroImage(item: SquarespaceItem): Promise<number | undefined> {
  if (!item.assetUrl) return undefined
  const filename = `insight-${item.urlId}`
  const { docs } = await payload.find({
    collection: 'media',
    depth: 0,
    limit: 1,
    where: { filename: { like: filename } },
  })
  if (docs[0]) return docs[0].id

  const image = await fetch(`${item.assetUrl}?format=1500w`)
  const mimetype = image.headers.get('content-type')?.split(';')[0] ?? ''
  if (!image.ok || !mimetype.startsWith('image/')) {
    warn(`couldn’t download the image for “${item.title}” (${image.status} ${mimetype})`)
    return undefined
  }
  const data = Buffer.from(await image.arrayBuffer())
  const extension = mimetype.split('/')[1].replace('jpeg', 'jpg')
  const doc = await payload.create({
    collection: 'media',
    context: context(),
    // A placeholder description: review it in the admin (Squarespace exports no alt text).
    data: { alt: `Header image for the article “${item.title}”` },
    file: { data, mimetype, name: `${filename}.${extension}`, size: data.length },
  })
  return doc.id
}

let created = 0
for (const item of items) {
  const slug = item.urlId
  if (!SLUG_PATTERN.test(slug)) {
    warn(`skipped “${item.title}”: its address /insights/${slug} isn’t a valid slug here`)
    continue
  }
  const { totalDocs } = await payload.count({
    collection: 'articles',
    where: { slug: { equals: slug } },
  })
  if (totalDocs > 0) {
    log(`“${slug}” already exists, skipped`)
    continue
  }

  const markdown = htmlToMarkdown(item.body)
  const heroImage = await importHeroImage(item)
  if (!heroImage) {
    warn(`skipped “${item.title}”: articles need a header image`)
    continue
  }
  const excerptSource = plainText(item.excerpt ?? '') || plainText(markdown.split('\n\n')[0] ?? '')
  const tags = [...(item.tags ?? []), ...(item.categories ?? [])]

  await payload.create({
    collection: 'articles',
    context: context(),
    data: {
      title: plainText(item.title),
      slug,
      generateSlug: false,
      excerpt: truncate(excerptSource, 300),
      heroImage,
      content: convertMarkdownToLexical({ editorConfig, markdown }),
      author: authorFor(item.author?.displayName).id,
      tags: tags.length > 0 ? tags : ['Insights'],
      publishedAt: new Date(item.publishOn).toISOString(),
      _status: 'published',
    },
  })
  created += 1
  log(`created “${slug}” (${new Date(item.publishOn).toISOString().slice(0, 10)})`)
}

log(`done: ${created} created. Now refresh the site's cache once (POST /api/revalidate).`)
