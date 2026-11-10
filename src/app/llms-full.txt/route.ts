import { llmsFullTxt } from '@/lib/llms'
import { richTextToMarkdown } from '@/lib/plain-content'
import { getPublishedArticlesForIndexes, getServices, getServiceBySlug } from '@/lib/queries'
import { siteUrl } from '@/lib/site-url'
import { ORGANISATION_DESCRIPTION } from '@/lib/structured-data'

// The full text of every service and published article in one Markdown file (llmstxt.org).
export const revalidate = 3600

export async function GET() {
  const [services, articles] = await Promise.all([getServices(), getPublishedArticlesForIndexes()])

  const serviceDocs = await Promise.all(
    services.map(async (service) => {
      const full = await getServiceBySlug(service.slug ?? '')
      return {
        title: service.title,
        path: `/services/${service.slug}`,
        summary: service.summary,
        markdown: full ? await richTextToMarkdown(full.body) : '',
      }
    }),
  )
  const articleDocs = await Promise.all(
    articles.map(async (article) => {
      const author = typeof article.author === 'object' ? article.author : null
      const profile = author && typeof author.profile === 'object' ? author.profile : null
      return {
        title: article.title,
        path: `/articles/${article.slug}`,
        summary: article.excerpt,
        date: article.publishedAt ?? article.createdAt,
        author: profile ? `${profile.name}, ${profile.role}` : author?.name,
        markdown: [
          ...(article.keyTakeaways?.length
            ? ['In short:', ...article.keyTakeaways.map((t) => `- ${t.point}`), '']
            : []),
          await richTextToMarkdown(article.content),
        ].join('\n'),
      }
    }),
  )

  const body = llmsFullTxt({
    base: siteUrl(),
    description: ORGANISATION_DESCRIPTION,
    documents: [...serviceDocs, ...articleDocs],
  })
  return new Response(body, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } })
}
