import { selmaInfo } from '@/lib/family'
import { llmsTxt } from '@/lib/llms'
import { getPageCopy, getPublishedArticlesForIndexes, getServices } from '@/lib/queries'
import { getSiteSettings } from '@/lib/site-settings'
import { siteUrl } from '@/lib/site-url'
import { ORGANISATION_DESCRIPTION } from '@/lib/structured-data'

// A Markdown summary of the site for AI assistants (llmstxt.org). Cached for an hour and
// refreshed when articles, services, team or page copy change.
export const revalidate = 3600

export async function GET() {
  const [settings, copy, services, articles] = await Promise.all([
    getSiteSettings(),
    getPageCopy(),
    getServices(),
    getPublishedArticlesForIndexes(30),
  ])
  const selma = selmaInfo(settings)

  const body = llmsTxt({
    base: siteUrl(),
    description: ORGANISATION_DESCRIPTION,
    aboutLead: copy.about?.lead,
    locality: settings.organisation?.locality,
    contactEmail: settings.contactEmail,
    selma: selma.show ? { url: selma.url, tagline: selma.tagline, summary: selma.summary } : null,
    services: services.map((s) => ({
      title: s.title,
      path: `/services/${s.slug}`,
      summary: s.summary,
    })),
    articles: articles.map((a) => ({
      title: a.title,
      path: `/articles/${a.slug}`,
      summary: a.excerpt,
      date: a.publishedAt ?? a.createdAt,
    })),
  })
  return new Response(body, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } })
}
