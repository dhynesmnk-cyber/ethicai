import config from '@payload-config'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import { SLUG_PATTERN } from '@/lib/site-url'

// Opens an article in Next.js draft mode. Only works for someone signed in to the admin: the
// Payload session cookie is checked here, so no shared preview secret is needed.
export async function GET(request: Request): Promise<Response> {
  const slug = new URL(request.url).searchParams.get('slug') ?? ''
  if (!SLUG_PATTERN.test(slug)) {
    return new Response('Invalid article slug.', { status: 400 })
  }

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) {
    return new Response('Sign in to the admin to preview drafts.', { status: 401 })
  }

  ;(await draftMode()).enable()
  redirect(`/articles/${slug}`)
}
