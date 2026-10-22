import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

import { SLUG_PATTERN } from '@/lib/site-url'

export async function GET(request: Request): Promise<Response> {
  ;(await draftMode()).disable()

  const slug = new URL(request.url).searchParams.get('slug') ?? ''
  redirect(SLUG_PATTERN.test(slug) ? `/articles/${slug}` : '/')
}
