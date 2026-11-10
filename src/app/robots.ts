import type { MetadataRoute } from 'next'

import { robotsRules } from '@/lib/robots'
import { getSiteSettings } from '@/lib/site-settings'
import { isReviewSite, siteUrl } from '@/lib/site-url'

// BUILD-SPEC §9: keep the admin and API out of search engines, plus the temporary review pages.
// AI crawlers follow the policy in Site settings → Search (allow-all by default).
// Saving Site settings refreshes every page, this one included.
export const revalidate = 3600

export default async function robots(): Promise<MetadataRoute.Robots> {
  // A netlify.app review site is for the owner and client only: ask crawlers to stay away entirely.
  if (isReviewSite()) return { rules: { userAgent: '*', disallow: '/' } }

  const { search } = await getSiteSettings()
  return {
    rules: robotsRules(search?.aiCrawlers ?? 'allow-all'),
    sitemap: `${siteUrl()}/sitemap.xml`,
  }
}
