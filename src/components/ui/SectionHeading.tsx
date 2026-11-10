import Link from 'next/link'

import { ArrowRightIcon } from '@/components/icons'
import { cn } from '@/lib/cn'

type Props = {
  title: string
  description?: string
  /** e.g. "View all articles" linking to the listing. */
  action?: { href: string; label: string }
  as?: 'h1' | 'h2' | 'h3'
  /** Lets a <section aria-labelledby> point at this heading. */
  id?: string
  /** Centred, for short sections such as testimonials. */
  align?: 'start' | 'center'
  /** Colours for night sections. */
  tone?: 'light' | 'dark'
  className?: string
}

export function SectionHeading({
  title,
  description,
  action,
  as: Heading = 'h2',
  id,
  align = 'start',
  tone = 'light',
  className,
}: Props) {
  const dark = tone === 'dark'
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        align === 'center' && 'items-center text-center',
        // Side by side with its "View all" link; on its own it keeps to the top of its box.
        align !== 'center' && action && 'sm:flex-row sm:items-end sm:justify-between sm:gap-8',
        className,
      )}
    >
      <div className={cn('max-w-3xl', align === 'center' && 'mx-auto')}>
        <Heading
          id={id}
          className={cn(
            Heading === 'h1'
              ? 'text-4xl sm:text-5xl lg:text-6xl'
              : 'text-3xl sm:text-4xl lg:text-[2.75rem]',
            dark ? 'text-white' : 'text-ink',
          )}
        >
          {title}
        </Heading>
        {description && (
          <p className={cn('mt-4 text-lg', dark ? 'text-night-muted' : 'text-muted')}>
            {description}
          </p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className={cn(
            'group inline-flex shrink-0 items-center gap-1.5 font-semibold underline-offset-4 hover:underline',
            dark ? 'text-accent-soft hover:text-white' : 'text-accent hover:text-accent-strong',
          )}
        >
          {action.label}
          <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  )
}
