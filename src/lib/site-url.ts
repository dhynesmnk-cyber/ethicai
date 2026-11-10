/** Canonical site origin, used for absolute URLs (admin preview links, metadata). */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '')
}

/**
 * True while the site is served from a Netlify review address (https://<name>.netlify.app), which
 * must stay out of search engines. It turns itself off when NEXT_PUBLIC_SITE_URL becomes the real
 * domain at launch, so nobody has to remember to flip a switch.
 */
export function isReviewSite(url: string = siteUrl()): boolean {
  try {
    return new URL(url).hostname.endsWith('.netlify.app')
  } catch {
    return false
  }
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** Path that switches on Next.js draft mode (signed-in users only) and opens the article. */
export function articlePreviewPath(slug: string): string {
  return `/api/preview?slug=${encodeURIComponent(slug)}`
}
