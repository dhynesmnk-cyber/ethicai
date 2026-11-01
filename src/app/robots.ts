import type { MetadataRoute } from 'next'

import { siteUrl } from '@/lib/site-url'

// BUILD-SPEC §9: keep the admin and API out of search engines, plus the temporary review pages.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/', '/kitchen-sink', '/media-check', '/contact/thanks'],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  }
}
