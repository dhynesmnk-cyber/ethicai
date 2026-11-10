import type { Metadata } from 'next'

// Page metadata in one shape (BUILD-SPEC §9): title (the layout adds "— EthicAI"), description,
// canonical URL and matching Open Graph/Twitter tags. Next.js merges metadata shallowly, so each
// page sets the whole Open Graph block through here rather than relying on the layout's.

export const SITE_NAME = 'EthicAI'
/**
 * The Home page title. It names what EthicAI is and where, which is what people (and AI
 * assistants) search for; the "A.I. grounded in human dignity" line stays as the visible headline.
 */
export const HOME_TITLE = `${SITE_NAME}: AI ethics and governance consultancy, Sydney`
export const DEFAULT_DESCRIPTION =
  'Sydney-based AI ethics and governance consultancy helping organisations adopt AI ethically, with people at the centre. The team behind Selma, local AI.'

/** The articles feed, linked from every page's <head> so feed readers and crawlers find it. */
export const FEED_PATH = '/articles/feed.xml'

type Options = {
  title?: string
  description?: string
  /** Path for the canonical URL, e.g. "/about" (made absolute via metadataBase). */
  path: string
  noindex?: boolean
  /** Extra Open Graph fields for articles. */
  article?: { publishedTime?: string; modifiedTime?: string; tags?: string[] }
}

export function pageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  noindex = false,
  article,
}: Options): Metadata {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : HOME_TITLE
  const shared = { title: fullTitle, description, url: path, siteName: SITE_NAME, locale: 'en_AU' }

  return {
    ...(title ? { title } : {}),
    description,
    alternates: {
      canonical: path,
      types: { 'application/rss+xml': [{ url: FEED_PATH, title: 'EthicAI articles' }] },
    },
    openGraph: article
      ? { ...shared, type: 'article', ...article }
      : { ...shared, type: 'website' },
    twitter: { card: 'summary_large_image', title: fullTitle, description },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  }
}
