/** Canonical site origin, used for absolute URLs (admin preview links, metadata). */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '')
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** Path that switches on Next.js draft mode (signed-in users only) and opens the article. */
export function articlePreviewPath(slug: string): string {
  return `/api/preview?slug=${encodeURIComponent(slug)}`
}
