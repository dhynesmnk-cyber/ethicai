import { revalidatePath } from 'next/cache'
import type { PayloadRequest, RequestContext } from 'payload'

// Content hooks call this so published changes reach the public site within seconds
// (BUILD-SPEC §9). Payload runs inside Next.js, so hooks can revalidate directly.
// Scripts that run outside Next (seed, tests) pass `context: { disableRevalidate: true }`.

declare module 'payload' {
  interface RequestContext {
    disableRevalidate?: boolean
  }
}

export function revalidatePaths(
  req: PayloadRequest,
  context: RequestContext,
  paths: string[],
): void {
  if (context.disableRevalidate) return

  const unique = [...new Set(paths)]
  for (const path of unique) revalidatePath(path)
  req.payload.logger.info(`Revalidated ${unique.join(', ')}`)
}

/** Header/footer data (siteSettings) appears on every page. */
export function revalidateEverything(req: PayloadRequest, context: RequestContext): void {
  if (context.disableRevalidate) return

  revalidatePath('/', 'layout')
  req.payload.logger.info('Revalidated all pages')
}
