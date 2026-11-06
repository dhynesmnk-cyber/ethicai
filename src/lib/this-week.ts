// Small helpers for the admin dashboard's "This week" panel (BUILD-SPEC §8).

const DAY_MS = 24 * 60 * 60 * 1000

/** The runbook link from NEXT_PUBLIC_RUNBOOK_URL, or null if it is unset or not a web link. */
export function runbookUrl(raw: string | undefined | null): string | null {
  if (!raw) return null
  try {
    const url = new URL(raw.trim())
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null
  } catch {
    return null
  }
}

export type PublishingPace = {
  /** True when something was published in the last seven days. */
  publishedThisWeek: boolean
  /** Plain-English summary for the panel, e.g. "Published 3 days ago". */
  summary: string
}

/** Describes how recently the last article went live, in whole days (Australian English). */
export function publishingPace(
  lastPublishedAt: string | Date | null | undefined,
  now: Date = new Date(),
): PublishingPace {
  if (!lastPublishedAt) {
    return { publishedThisWeek: false, summary: 'Nothing has been published yet.' }
  }
  const published = new Date(lastPublishedAt)
  if (Number.isNaN(published.getTime())) {
    return { publishedThisWeek: false, summary: 'Nothing has been published yet.' }
  }
  const days = Math.floor((now.getTime() - published.getTime()) / DAY_MS)
  // The site has no scheduling: an article with a future date is live and sorts to the top, which
  // is usually a typo in the date.
  if (days < 0) {
    return { publishedThisWeek: true, summary: 'Dated in the future. Check its publish date.' }
  }
  const publishedThisWeek = days < 7
  if (days === 0) return { publishedThisWeek, summary: 'Published today.' }
  if (days === 1) return { publishedThisWeek, summary: 'Published yesterday.' }
  return { publishedThisWeek, summary: `Published ${days} days ago.` }
}
