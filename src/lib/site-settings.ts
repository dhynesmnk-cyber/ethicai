import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

/** The siteSettings global, read once per render (Local API bypasses its admin-only access). */
export const getSiteSettings = cache(async () => {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'siteSettings', depth: 0 })
})

/** Where "Subscribe" buttons go: Substack's subscribe page when set, otherwise /newsletter. */
export function subscribeHref(substackPublicationUrl: string | null | undefined): string {
  return substackPublicationUrl
    ? `${substackPublicationUrl.replace(/\/+$/, '')}/subscribe`
    : '/newsletter'
}
