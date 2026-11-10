import type { Metadata } from 'next'

// Page metadata in one shape (BUILD-SPEC §9): title (the layout adds "— EthicAI"), description,
// canonical URL and matching Open Graph/Twitter tags. Next.js merges metadata shallowly, so each
// page sets the whole Open Graph block through here rather than relying on the layout's.

export const SITE_NAME = 'EthicAI'
export const DEFAULT_DESCRIPTION =
  'EthicAI helps organisations adopt AI ethically, blending sharp operational insight with deep people strategy.'

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
  const fullTitle = title
    ? `${title} — ${SITE_NAME}`
    : `${SITE_NAME}: A.I. grounded in human dignity`
  const shared = { title: fullTitle, description, url: path, siteName: SITE_NAME, locale: 'en_AU' }

  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: article
      ? { ...shared, type: 'article', ...article }
      : { ...shared, type: 'website' },
    twitter: { card: 'summary_large_image', title: fullTitle, description },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  }
}
