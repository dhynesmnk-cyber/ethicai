import Image from 'next/image'
import type { ReactNode } from 'react'

import { Breadcrumbs, type Crumb } from '@/components/family/Breadcrumbs'
import { RingMark } from '@/components/family/RingMark'
import { Container } from '@/components/layout/Container'
import { cn } from '@/lib/cn'
import type { ImageData } from '@/lib/media'

type Props = {
  eyebrow?: string | null
  title: string
  lead?: string | null
  /** Buttons under the text. */
  actions?: ReactNode
  /** Optional background photo; without one the animated indigo light shows. */
  image?: ImageData | null
  /** `full`: the Home opening (fills the screen). `page`: shorter, for inner pages. */
  size?: 'full' | 'page'
  /** Shown above the eyebrow on inner pages. */
  breadcrumbs?: Crumb[]
  /** Extra content below the text. */
  children?: ReactNode
}

/**
 * The dark, cinematic opening shared with selma.au: text sits low on the left over night, with a
 * soft indigo aurora (or a photo under a fade) and the family ring mark. It slides up under the
 * sticky header (`.hero-dark`), which stays transparent until the page scrolls.
 *
 * DECISION: a still photo or CSS light, never selma.au's background video: AGENTS.md rule 3 keeps
 * video files off this site, and a video would cost the Largest Contentful Paint budget.
 */
export function DarkHero({
  eyebrow,
  title,
  lead,
  actions,
  image,
  size = 'page',
  breadcrumbs,
  children,
}: Props) {
  const full = size === 'full'
  return (
    <section
      aria-labelledby="page-title"
      className={cn(
        'hero-dark on-night grain relative isolate flex flex-col justify-end overflow-hidden',
        full ? 'min-h-[min(100svh,60rem)]' : 'min-h-[28rem] sm:min-h-[32rem]',
      )}
    >
      {image ? (
        <>
          <Image
            src={image.url}
            alt=""
            fill
            // The Largest Contentful Paint element: fetch it first (`priority` is deprecated in Next 16).
            loading="eager"
            fetchPriority="high"
            sizes="100vw"
            className="-z-10 object-cover object-[center_30%]"
          />
          <div className="absolute inset-0 -z-10 bg-linear-to-b from-night/20 via-night/45 to-night/90" />
        </>
      ) : (
        <div className="aurora -z-10" />
      )}
      <RingMark
        animated
        className={cn(
          'pointer-events-none absolute -z-10 text-accent-soft',
          full
            ? 'top-1/2 right-[-12rem] size-[34rem] -translate-y-1/2 opacity-25 sm:right-[-6rem] sm:opacity-40 lg:right-8 lg:size-[40rem]'
            : 'top-1/2 right-[-10rem] size-[26rem] -translate-y-1/2 opacity-15 sm:opacity-30 lg:right-0',
        )}
      />

      <Container className={cn('relative', full ? 'pt-24 pb-16 sm:pb-24' : 'pt-16 pb-14 sm:pb-20')}>
        {breadcrumbs && breadcrumbs.length > 1 && (
          <Breadcrumbs items={breadcrumbs} tone="dark" className="mb-8" />
        )}
        {eyebrow && <p className="rise eyebrow mb-5 text-accent-soft [--rise-step:0]">{eyebrow}</p>}
        <h1
          id="page-title"
          className={cn(
            'rise max-w-4xl text-white [--rise-step:1]',
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
              'rise mt-6 max-w-2xl font-light text-white/75 [--rise-step:2]',
              full ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl',
            )}
          >
            {lead}
          </p>
        )}
        {actions && (
          <div className="rise mt-10 flex flex-wrap items-center gap-x-7 gap-y-4 [--rise-step:3]">
            {actions}
          </div>
        )}
        {children}
      </Container>
    </section>
  )
}
