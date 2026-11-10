import { after } from 'next/server'

import { isReviewSite, siteUrl } from '@/lib/site-url'

// IndexNow (indexnow.org): tells Bing and the other IndexNow engines straight away when a page is
// published, changed or removed, instead of waiting for them to recrawl. Bing's index also feeds
// Copilot and DuckDuckGo and is one of the sources behind ChatGPT search. Google doesn't use
// IndexNow; it reads the sitemap.
//
// Needs INDEXNOW_KEY (8–128 letters, numbers or hyphens). The key isn't secret: IndexNow checks it
// by fetching /indexnow-key.txt from this site. Off without a key, on review sites and locally.

const ENDPOINT = 'https://api.indexnow.org/indexnow'
const KEY_PATTERN = /^[A-Za-z0-9-]{8,128}$/

export function indexNowKey(value = process.env.INDEXNOW_KEY): string | null {
  return value && KEY_PATTERN.test(value) ? value : null
}

/** Only for the real public site: never review sites, localhost or without a valid key. */
export function indexNowEnabled(base = siteUrl(), key = indexNowKey()): boolean {
  if (!key || isReviewSite(base)) return false
  try {
    const { protocol, hostname } = new URL(base)
    return protocol === 'https:' && hostname !== 'localhost' && !hostname.endsWith('.local')
  } catch {
    return false
  }
}

/** Page URLs only: feeds and text files aren't pages IndexNow should be told about. */
export function indexNowBody(paths: string[], base: string, key: string) {
  const urlList = [...new Set(paths)]
    .filter((path) => !/\.(txt|xml)$/.test(path))
    .map((path) => `${base}${path === '/' ? '/' : path}`)
  return { host: new URL(base).host, key, keyLocation: `${base}/indexnow-key.txt`, urlList }
}

type Logger = { info: (message: string) => void; warn: (message: string) => void }

async function send(paths: string[], logger?: Logger): Promise<void> {
  const base = siteUrl()
  const key = indexNowKey()
  if (!key) return
  const body = indexNowBody(paths, base, key)
  if (body.urlList.length === 0) return
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    })
    // 200 and 202 both mean accepted.
    if (response.ok) logger?.info(`IndexNow notified: ${body.urlList.join(', ')}`)
    else logger?.warn(`IndexNow answered ${response.status}`)
  } catch (error) {
    logger?.warn(`IndexNow failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Queues the notification to run after the response is sent, so publishing never waits on it
 * (and never fails because of it).
 */
export function notifyIndexNow(paths: string[], logger?: Logger): void {
  if (!indexNowEnabled()) return
  try {
    after(() => send(paths, logger))
  } catch {
    // Outside a request (e.g. a script): send it now, without waiting.
    void send(paths, logger)
  }
}
