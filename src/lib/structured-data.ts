import type { ImageData } from '@/lib/media'
import { siteUrl } from '@/lib/site-url'
import { youtubeThumbnailUrl } from '@/lib/video-url'
import type { Article, Video } from '@/payload-types'

// schema.org JSON-LD (BUILD-SPEC §9): Organization site-wide, Article (+ VideoObject) and
// BreadcrumbList on article pages.

type Schema = Record<string, unknown>

export function organisationSchema(sameAs: string[]): Schema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'EthicAI',
    url: siteUrl(),
    description:
      'EthicAI helps organisations adopt AI ethically, blending sharp operational insight with deep people strategy.',
    ...(sameAs.length ? { sameAs } : {}),
  }
}

export function articleSchema(article: Article, image: ImageData | null): Schema {
  const url = `${siteUrl()}/articles/${article.slug}`
  const author = typeof article.author === 'object' ? article.author : null
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    url,
    mainEntityOfPage: url,
    datePublished: article.publishedAt ?? article.createdAt,
    dateModified: article.updatedAt,
    ...(image ? { image: [image.url] } : {}),
    ...(author ? { author: { '@type': 'Person', name: author.name } } : {}),
    publisher: { '@type': 'Organization', name: 'EthicAI', url: siteUrl() },
    ...(article.tags?.length ? { keywords: article.tags.join(', ') } : {}),
  }
}

export function videoSchema(video: Video, description: string, thumbnail?: string): Schema | null {
  if (video.platform !== 'youtube' || !video.videoId) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description,
    thumbnailUrl: [thumbnail ?? youtubeThumbnailUrl(video.videoId)],
    uploadDate: video.publishedAt,
    contentUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${video.videoId}`,
  }
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>): Schema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteUrl()}${item.path}`,
    })),
  }
}
