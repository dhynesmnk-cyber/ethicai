import { createHash, timingSafeEqual } from 'node:crypto'

// Request checks for POST /api/revalidate (kept apart from the route so they can be unit tested).

const MAX_PATHS = 50
// A site path: starts with a single "/", no query string, fragment, spaces or control characters.
const SITE_PATH = /^\/(?!\/)[A-Za-z0-9\-._~%/]*$/

const digest = (value: string) => createHash('sha256').update(value).digest()

/** True when the request carries `Authorization: Bearer <secret>`. Constant-time comparison. */
export function hasBearerSecret(authorization: string | null, secret: string): boolean {
  const match = /^Bearer (.+)$/.exec(authorization ?? '')
  if (!match || !secret) return false
  return timingSafeEqual(digest(match[1]), digest(secret))
}

export type RevalidateBody = { paths: string[] } | { error: string }

/**
 * Reads `{ "paths": ["/", "/articles"] }`. No body, or no `paths`, means every page (an empty
 * list). Anything that isn't a plain site path is refused rather than guessed at.
 */
export function parseRevalidateBody(body: unknown): RevalidateBody {
  if (body === null || body === undefined) return { paths: [] }
  if (typeof body !== 'object' || Array.isArray(body)) return { error: 'Expected a JSON object.' }

  const { paths } = body as { paths?: unknown }
  if (paths === undefined) return { paths: [] }
  if (!Array.isArray(paths) || paths.length === 0 || paths.length > MAX_PATHS) {
    return { error: `"paths" must be a list of 1 to ${MAX_PATHS} site paths.` }
  }
  const invalid = paths.find(
    (path) => typeof path !== 'string' || path.length > 200 || !SITE_PATH.test(path),
  )
  if (invalid !== undefined) {
    return { error: `Not a site path: ${JSON.stringify(invalid)}. Use paths like "/articles".` }
  }
  return { paths: [...new Set(paths as string[])] }
}
