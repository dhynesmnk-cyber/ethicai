import type { ReactNode } from 'react'

import { Breadcrumbs, type Crumb } from '@/components/family/Breadcrumbs'
import { Photo } from '@/components/family/Photo'
import { Container } from '@/components/layout/Container'
import { cn } from '@/lib/cn'
import type { Photo as PhotoData } from '@/lib/photography'

type Props = {
  /** A short line above the headline, e.g. "AI ethics and governance · Sydney". */
  kicker?: string | null
  title: string
  lead?: string | null
  /** Buttons under the text. */
  actions?: ReactNode
  /** The background photograph. Without one the page opens on a plain light header. */
  photo?: PhotoData | null
  /** `full`: the Home opening (fills the screen). `page`: shorter, for inner pages. */
  size?: 'full' | 'page'
  /** Shown above the headline on inner pages. */
  breadcrumbs?: Crumb[]
  /** Extra content below the text. */
  children?: ReactNode
}

/**
 * A page's opening, in selma.au's photographic style: a full-bleed photograph of Australian
 * native trees with the headline low on the left. It slides up under the sticky header
 * (`.hero-dark`), which stays transparent until the page scrolls.
 *
 * DECISION: a still photograph, never a background video (AGENTS.md rule 3 keeps video files off
 * this site, and a video would cost the Largest Contentful Paint budget), and no decorative
 * motion: the photo carries the page.
 */
export function PageHero({
  kicker,
  title,
  lead,
  actions,
  photo,
  size = 'page',
  breadcrumbs,
  children,
}: Props) {
  const full = size === 'full'
  const dark = Boolean(photo)
  return (
    <section
      aria-labelledby="page-title"
      className={cn(
        'relative isolate flex flex-col justify-end overflow-hidden',
        dark ? 'hero-dark on-night' : 'border-b border-line bg-mist',
        full && 'min-h-[min(100svh,62rem)]',
        !full && dark && 'min-h-[30rem] sm:min-h-[36rem]',
      )}
    >
      {photo && (
        <>
          <Photo
            photo={photo}
            // The Largest Contentful Paint element: fetch it first (`priority` is deprecated in Next 16).
            loading="eager"
            fetchPriority="high"
            // The full-screen Home photo is as tall as the screen; on a portrait screen that makes
            // it wider than the screen. 80vh (not the exact ~125vh) keeps phones near 1–2k pixels.
            sizes={full ? '(orientation: portrait) 80vh, 100vw' : undefined}
            className="-z-10"
          />
          {/* Keeps the white menu readable over bright sky, and the headline over the lower half. */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 -z-10 h-60 bg-linear-to-b from-night/75 via-night/35 to-transparent"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-linear-to-t from-night/90 via-night/55 via-60% to-transparent"
          />
        </>
      )}

      <Container
        className={cn(
          'relative',
          full ? 'pt-28 pb-16 sm:pb-24' : dark ? 'pt-28 pb-14 sm:pb-20' : 'pt-12 pb-14 sm:pt-16',
        )}
      >
        {breadcrumbs && breadcrumbs.length > 1 && (
          <Breadcrumbs items={breadcrumbs} tone={dark ? 'dark' : 'light'} className="mb-8" />
        )}
        {kicker && (
          <p className={cn('mb-4 text-lg font-medium', dark ? 'text-white/85' : 'text-muted')}>
            {kicker}
          </p>
        )}
        <h1
          id="page-title"
          className={cn(
            'max-w-4xl',
            dark ? 'text-white' : 'text-ink',
            full
              ? 'text-[clamp(2.75rem,8.5vw,6.75rem)] leading-[0.98]'
              : 'text-[clamp(2.25rem,6vw,4.5rem)]',
          )}
        >
          {title}
        </h1>
        {lead && (
          <p
            className={cn(
              'mt-6 max-w-2xl font-light',
              dark ? 'text-white/85' : 'text-muted',
              full ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl',
            )}
          >
            {lead}
          </p>
        )}
        {actions && (
          <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">{actions}</div>
        )}
        {children}
      </Container>
    </section>
  )
}
