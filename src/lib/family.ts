import { SELMA_DEFAULTS } from '@/content/defaults'
import type { SiteSetting } from '@/payload-types'

export type SelmaInfo = {
  show: boolean
  url: string
  waitlistUrl: string
  tagline: string
  summary: string
  suite: Array<{ name: string; kicker?: string | null; description: string }>
}

/**
 * Selma's details from siteSettings. The two links fall back to selma.au so a blank field can
 * never produce a broken link; the text fields are shown only when they have content.
 */
export function selmaInfo(settings: Pick<SiteSetting, 'selma'>): SelmaInfo {
  const selma = settings.selma ?? {}
  return {
    show: selma.show !== false,
    url: selma.url || SELMA_DEFAULTS.url,
    waitlistUrl: selma.waitlistUrl || SELMA_DEFAULTS.waitlistUrl,
    tagline: selma.tagline ?? '',
    summary: selma.summary ?? '',
    suite: (selma.suite ?? []).map(({ name, kicker, description }) => ({
      name,
      kicker,
      description,
    })),
  }
}

/** "selma.au" from "https://selma.au/", for link text and accessible names. */
export function displayHost(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, '')
  } catch {
    return url
  }
}
