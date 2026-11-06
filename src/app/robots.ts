import type { MetadataRoute } from 'next'

import { isReviewSite, siteUrl } from '@/lib/site-url'

// BUILD-SPEC §9: keep the admin and API out of search engines, plus the temporary review pages.
export default function robots(): MetadataRoute.Robots {
  // A netlify.app review site is for the owner and client only: ask crawlers to stay away entirely.
  if (isReviewSite()) return { rules: { userAgent: '*', disallow: '/' } }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/', '/kitchen-sink', '/media-check', '/contact/thanks'],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  }
}
