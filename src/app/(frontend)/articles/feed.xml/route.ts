import { rssFeed } from '@/lib/feed'
import { getPublishedArticlesForIndexes } from '@/lib/queries'
import { siteUrl } from '@/lib/site-url'

// RSS 2.0 feed of the latest articles. Cached for an hour and refreshed on publish.
export const revalidate = 3600

export async function GET() {
  const articles = await getPublishedArticlesForIndexes(30)
  const body = rssFeed({
    base: siteUrl(),
    title: 'EthicAI articles',
    description:
      'Short reads from EthicAI on adopting AI ethically: people, culture, governance and practical change.',
    items: articles.map((article) => {
      const author = typeof article.author === 'object' ? article.author : null
      const profile = author && typeof author.profile === 'object' ? author.profile : null
      return {
        title: article.title,
        path: `/articles/${article.slug}`,
        summary: article.excerpt,
        date: article.publishedAt ?? article.createdAt,
        author: profile?.name ?? author?.name,
        categories: article.tags,
      }
    }),
  })
  return new Response(body, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
