import Link from 'next/link'

import { ArrowRightIcon } from '@/components/icons'
import { cn } from '@/lib/cn'

type Props = {
  title: string
  eyebrow?: string
  description?: string
  /** e.g. "View all articles" linking to the listing. */
  action?: { href: string; label: string }
  as?: 'h1' | 'h2' | 'h3'
  /** Lets a <section aria-labelledby> point at this heading. */
  id?: string
  className?: string
}

export function SectionHeading({
  title,
  eyebrow,
  description,
  action,
  as: Heading = 'h2',
  id,
  className,
}: Props) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8',
        className,
      )}
    >
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-2 text-sm font-semibold tracking-wide text-accent uppercase">
            {eyebrow}
          </p>
        )}
        <Heading
          id={id}
          className={cn(
            Heading === 'h1' ? 'text-4xl sm:text-5xl' : 'text-3xl sm:text-4xl',
            'text-ink',
          )}
        >
          {title}
        </Heading>
        {description && <p className="mt-3 text-muted">{description}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex shrink-0 items-center gap-1.5 font-medium text-accent underline-offset-4 hover:text-accent-strong hover:underline"
        >
          {action.label}
          <ArrowRightIcon className="size-4" />
        </Link>
      )}
    </div>
  )
}
