// Elfsight TikTok Feed widget (BUILD-SPEC §7.1).
//
// Views cost money: Elfsight's free plan allows about 200 widget views a month per app, and every
// load of the widget uses one. That is why the widget script never loads on page load or on any
// page except /watch, and only after a visitor presses "Show latest TikToks". Paid plans raise the
// limit; once it is used up the widget stops showing until the next month.
//
// Elfsight's current install code (checked November 2026) is:
//   <script src="https://elfsightcdn.com/platform.js" async></script>
//   <div class="elfsight-app-<widget id>" data-elfsight-app-lazy></div>
// The spec's `data-eapps-link` and `static.elfsight.com` URL are from an older version of it.
// We leave out `data-elfsight-app-lazy` because the script itself is only added after the click.
//
// The widget ID ends up in a class name and decides which third-party widget runs, so it is
// checked strictly when an admin saves it and again before the page renders it.

export const ELFSIGHT_PLATFORM_SRC = 'https://elfsightcdn.com/platform.js'

const WIDGET_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
const WIDGET_CLASS = /elfsight-app-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/gi

/** True only for a bare, lower-case Elfsight widget ID (a UUID), the form we store. */
export function isElfsightWidgetId(value: unknown): value is string {
  return typeof value === 'string' && WIDGET_ID.test(value)
}

/**
 * The widget ID from whatever an admin pasted: the bare ID, the `elfsight-app-…` class, or the
 * whole install snippet from Elfsight's dashboard. Returns null if there isn't exactly one ID.
 */
export function parseElfsightWidgetId(input: unknown): string | null {
  if (typeof input !== 'string') return null
  const trimmed = input.trim().toLowerCase()
  if (WIDGET_ID.test(trimmed)) return trimmed

  const ids = new Set(Array.from(trimmed.matchAll(WIDGET_CLASS), (match) => match[1]))
  if (ids.size !== 1) return null
  const [id] = ids
  return isElfsightWidgetId(id) ? id : null
}

/** Payload field validation: empty, or something we can read a single widget ID from. */
export function validateElfsightWidgetId(value: string | null | undefined): true | string {
  if (!value || !value.trim() || parseElfsightWidgetId(value)) return true
  return 'Paste the widget ID (it looks like 1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d) or the whole install code from Elfsight.'
}

/** Payload field hook: store only the bare widget ID, whatever form it was pasted in. */
export function normaliseElfsightWidgetId(value: unknown): unknown {
  if (typeof value !== 'string') return value
  if (!value.trim()) return null
  return parseElfsightWidgetId(value) ?? value
}

/** The class name Elfsight's script looks for. Throws rather than build one from bad input. */
export function elfsightAppClass(widgetId: string): string {
  if (!isElfsightWidgetId(widgetId)) throw new Error('Invalid Elfsight widget ID')
  return `elfsight-app-${widgetId}`
}

let platformScript: Promise<void> | null = null

/**
 * Adds Elfsight's script to the page once (browser only) and resolves when it has loaded.
 * A failed load is forgotten so a later call can try again.
 */
export function loadElfsightPlatform(): Promise<void> {
  if (platformScript) return platformScript

  platformScript = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${ELFSIGHT_PLATFORM_SRC}"]`,
    )
    if (existing?.dataset.loaded === 'true') return resolve()

    const script = existing ?? document.createElement('script')
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true'
      resolve()
    })
    script.addEventListener('error', () => {
      script.remove()
      platformScript = null
      reject(new Error('Elfsight script failed to load'))
    })
    if (!existing) {
      script.src = ELFSIGHT_PLATFORM_SRC
      script.async = true
      document.body.append(script)
    }
  })
  return platformScript
}
