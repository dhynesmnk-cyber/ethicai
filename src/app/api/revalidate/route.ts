import { revalidatePath } from 'next/cache'

import { hasBearerSecret, parseRevalidateBody } from '@/lib/revalidate-request'

// POST /api/revalidate: refreshes cached pages on demand (BUILD-SPEC §3, §9).
//
//   curl -X POST https://www.ethicai.au/api/revalidate \
//     -H "Authorization: Bearer $REVALIDATE_SECRET" \
//     -H "Content-Type: application/json" -d '{"paths": ["/", "/articles"]}'
//
// Leave out the body to refresh every page.
//
// DECISION: publishing doesn't go through this route. Payload runs inside Next.js, so the
// collection and siteSettings hooks call revalidatePath() directly (src/lib/revalidate.ts), with
// no HTTP round trip or shared secret involved. This route covers changes made outside the
// running site, which can't revalidate themselves: scripts run from a laptop against the
// production database (the seed, imports, the Milestone 7 YouTube sync if it runs elsewhere), or a
// manual refresh when something looks stale. Switched off (404) unless REVALIDATE_SECRET is set.

const json = (body: unknown, status = 200) => Response.json(body, { status })

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret) return new Response('Not found', { status: 404 })
  if (!hasBearerSecret(request.headers.get('authorization'), secret)) {
    return json({ error: 'Missing or wrong secret.' }, 401)
  }

  let body: unknown = null
  const raw = await request.text()
  if (raw.trim()) {
    try {
      body = JSON.parse(raw)
    } catch {
      return json({ error: 'Body must be JSON.' }, 400)
    }
  }

  const parsed = parseRevalidateBody(body)
  if ('error' in parsed) return json({ error: parsed.error }, 400)

  if (parsed.paths.length === 0) {
    // Every page shares the root layout, so this refreshes the whole site.
    revalidatePath('/', 'layout')
    return json({ revalidated: 'all' })
  }
  for (const path of parsed.paths) revalidatePath(path)
  return json({ revalidated: parsed.paths })
}
