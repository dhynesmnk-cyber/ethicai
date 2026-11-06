import { getPayload } from 'payload'

import config from '../../src/payload.config'
import type { SiteSetting } from '../../src/payload-types'

type Patch = Partial<Omit<SiteSetting, 'id' | 'updatedAt' | 'createdAt'>>

/**
 * Runs `fn` with some siteSettings fields changed, then puts the old values back. Uses the Local
 * API outside Next.js, so revalidation is skipped (a fresh context object per call; see content.ts).
 */
export async function withSiteSettings(patch: Patch, fn: () => Promise<void>): Promise<void> {
  const payload = await getPayload({ config })
  const before = await payload.findGlobal({ slug: 'siteSettings', depth: 0 })
  const restore = Object.fromEntries(
    Object.keys(patch).map((key) => [key, before[key as keyof Patch] ?? null]),
  ) as Patch

  await payload.updateGlobal({
    slug: 'siteSettings',
    context: { disableRevalidate: true },
    data: patch,
  })
  try {
    await fn()
  } finally {
    await payload.updateGlobal({
      slug: 'siteSettings',
      context: { disableRevalidate: true },
      data: restore,
    })
  }
}
