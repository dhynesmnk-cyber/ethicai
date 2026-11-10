import type { MetadataRoute } from 'next'

import { toImage } from '@/lib/media'
import { getPageCopy, getPublishedArticlesForIndexes, getServices } from '@/lib/queries'
import { siteUrl } from '@/lib/site-url'

// Static pages, services and every published article, with when each last changed and the
// articles' header images (videos are excluded, BUILD-SPEC §9).
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()
  const [articles, services, copy] = await Promise.all([
    getPublishedArticlesForIndexes(),
    getServices(),
    getPageCopy(),
  ])
  const newestArticle = articles[0]?.updatedAt
  const copyUpdated = copy.updatedAt ?? undefined
  const latest = (...dates: Array<string | null | undefined>) =>
    dates
      .filter((d): d is string => Boolean(d))
      .sort()
      .at(-1)
  const url = (path: string) => `${base}${path === '/' ? '' : path}`

  const staticPages: MetadataRoute.Sitemap = [
    { url: url('/'), lastModified: latest(copyUpdated, newestArticle) },
    { url: url('/about'), lastModified: copyUpdated },
    {
      url: url('/services'),
      lastModified: latest(copyUpdated, ...services.map((s) => s.updatedAt)),
    },
    { url: url('/articles'), lastModified: newestArticle },
    { url: url('/watch') },
    { url: url('/newsletter') },
    { url: url('/contact') },
    { url: url('/privacy-policy') },
    { url: url('/photo-credits') },
  ]

  return [
    ...staticPages,
    ...services
      .filter((service) => service.slug)
      .map((service) => ({
        url: url(`/services/${service.slug}`),
        lastModified: service.updatedAt,
      })),
    ...articles
      .filter((article) => article.slug)
      .map((article) => {
        const image = toImage(article.heroImage, 'hero')
        return {
          url: url(`/articles/${article.slug}`),
          lastModified: article.updatedAt,
          ...(image ? { images: [image.url] } : {}),
        }
      }),
  ]
}
