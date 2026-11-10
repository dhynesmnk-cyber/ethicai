import config from '@payload-config'
import { getPayload, type Where } from 'payload'
import { cache } from 'react'

import type { Article } from '@/payload-types'

// Read-only content queries for the public pages, via the Payload Local API (BUILD-SPEC §11.2).
// The Local API skips access control, so every query here filters to published content itself.

export const ARTICLES_PER_PAGE = 9
export const VIDEOS_PER_PAGE = 9

const published: Where = { _status: { equals: 'published' } }

const payloadClient = () => getPayload({ config })

export async function getArticlesPage({
  page = 1,
  tag,
  query,
}: {
  page?: number
  tag?: string
  query?: string
}) {
  const and: Where[] = [published]
  if (tag) and.push({ tags: { equals: tag } })
  if (query) and.push({ or: [{ title: { like: query } }, { excerpt: { like: query } }] })

  const payload = await payloadClient()
  return payload.find({
    collection: 'articles',
    depth: 1,
    limit: ARTICLES_PER_PAGE,
    page,
    sort: '-publishedAt',
    where: { and },
  })
}

export async function getLatestArticles(limit = 3) {
  const payload = await payloadClient()
  const { docs } = await payload.find({
    collection: 'articles',
    depth: 1,
    limit,
    sort: '-publishedAt',
    where: published,
  })
  return docs
}

/** Every tag used on a published article, alphabetical, for the listing's filter chips. */
export async function getAllTags(): Promise<string[]> {
  const payload = await payloadClient()
  const { docs } = await payload.find({
    collection: 'articles',
    depth: 0,
    pagination: false,
    select: { tags: true },
    where: published,
  })
  const tags = new Set(docs.flatMap((doc) => doc.tags ?? []))
  return [...tags].sort((a, b) => a.localeCompare(b, 'en-AU'))
}

/** Cached per request, so generateMetadata and the page share one query. */
export const getArticleBySlug = cache(async (slug: string, draft: boolean) => {
  const payload = await payloadClient()
  const { docs } = await payload.find({
    collection: 'articles',
    depth: 2,
    draft,
    limit: 1,
    pagination: false,
    where: draft ? { slug: { equals: slug } } : { and: [{ slug: { equals: slug } }, published] },
  })
  return docs[0] as Article | undefined
})

export async function getPublishedArticleSlugs() {
  const payload = await payloadClient()
  const { docs } = await payload.find({
    collection: 'articles',
    depth: 0,
    pagination: false,
    select: { slug: true, updatedAt: true },
    where: published,
  })
  return docs
}

/** Other published articles sharing a tag with this one, newest first (BUILD-SPEC §5.4). */
export async function getRelatedArticles(article: Article, limit = 3) {
  if (!article.tags?.length) return []
  const payload = await payloadClient()
  const { docs } = await payload.find({
    collection: 'articles',
    depth: 1,
    limit,
    sort: '-publishedAt',
    where: {
      and: [published, { id: { not_equals: article.id } }, { tags: { in: article.tags } }],
    },
  })
  return docs
}

/** The previous (older) and next (newer) published articles by publish date. */
export async function getAdjacentArticles(article: Article) {
  const payload = await payloadClient()
  const at = article.publishedAt ?? article.createdAt
  const select = { slug: true, title: true } as const
  const [older, newer] = await Promise.all([
    payload.find({
      collection: 'articles',
      depth: 0,
      limit: 1,
      select,
      sort: '-publishedAt',
      where: { and: [published, { publishedAt: { less_than: at } }] },
    }),
    payload.find({
      collection: 'articles',
      depth: 0,
      limit: 1,
      select,
      sort: 'publishedAt',
      where: { and: [published, { publishedAt: { greater_than: at } }] },
    }),
  ])
  return { older: older.docs[0], newer: newer.docs[0] }
}

export async function getVideos({
  platform,
  featured,
  page = 1,
  limit = VIDEOS_PER_PAGE,
}: {
  platform?: 'youtube' | 'tiktok'
  featured?: boolean
  page?: number
  limit?: number
}) {
  const and: Where[] = []
  if (platform) and.push({ platform: { equals: platform } })
  if (featured) and.push({ featured: { equals: true } })

  const payload = await payloadClient()
  return payload.find({
    collection: 'videos',
    depth: 1,
    joins: {
      articles: { limit: 1, sort: '-publishedAt', where: published },
    },
    limit,
    page,
    sort: '-publishedAt',
    where: and.length ? { and } : undefined,
  })
}

export async function getTeamMembers() {
  const payload = await payloadClient()
  const { docs } = await payload.find({
    collection: 'teamMembers',
    depth: 1,
    pagination: false,
    sort: 'order',
    where: { published: { equals: true } },
  })
  return docs
}

export async function getTestimonials(limit = 3) {
  const payload = await payloadClient()
  const { docs } = await payload.find({
    collection: 'testimonials',
    depth: 0,
    limit,
    sort: 'order',
    where: { published: { equals: true } },
  })
  return docs
}

const publishedFlag: Where = { published: { equals: true } }

/** Published services in display order (Home, /services, footer, llms.txt). */
export async function getServices() {
  const payload = await payloadClient()
  const { docs } = await payload.find({
    collection: 'services',
    depth: 0,
    limit: 50,
    sort: 'order',
    where: publishedFlag,
  })
  return docs
}

/** Cached per request, so generateMetadata and the page share one query. */
export const getServiceBySlug = cache(async (slug: string) => {
  const payload = await payloadClient()
  const { docs } = await payload.find({
    collection: 'services',
    depth: 1,
    limit: 1,
    pagination: false,
    where: { and: [{ slug: { equals: slug } }, publishedFlag] },
  })
  return docs[0]
})

/** The Home/About/Services page text (pageCopy global), read once per render. */
export const getPageCopy = cache(async () => {
  const payload = await payloadClient()
  return payload.findGlobal({ slug: 'pageCopy', depth: 1 })
})

/** Every published article with what the sitemap, feed and llms.txt need, newest first. */
export async function getPublishedArticlesForIndexes(limit = 0) {
  const payload = await payloadClient()
  const { docs } = await payload.find({
    collection: 'articles',
    depth: 2,
    ...(limit ? { limit } : { pagination: false }),
    sort: '-publishedAt',
    where: published,
  })
  return docs
}
