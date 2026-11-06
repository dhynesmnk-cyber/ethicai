import type { MetadataRoute } from 'next'

import { getPublishedArticleSlugs } from '@/lib/queries'
import { siteUrl } from '@/lib/site-url'

// Static pages plus every published article (videos are excluded, BUILD-SPEC §9).
export const revalidate = 3600

const STATIC_PATHS = [
  '/',
  '/about',
  '/articles',
  '/watch',
  '/newsletter',
  '/contact',
  '/privacy-policy',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()
  const articles = await getPublishedArticleSlugs()

  return [
    ...STATIC_PATHS.map((path) => ({ url: `${base}${path === '/' ? '' : path}` })),
    ...articles
      .filter((article) => article.slug)
      .map((article) => ({
        url: `${base}/articles/${article.slug}`,
        lastModified: article.updatedAt,
      })),
  ]
}
