import Link from 'next/link'

import { ArrowLeftIcon, ArrowRightIcon } from '@/components/icons'
import { cn } from '@/lib/cn'

type Props = {
  page: number
  totalPages: number
  /** Builds the URL for a page, e.g. (n) => `/articles?page=${n}`. */
  hrefForPage: (page: number) => string
  className?: string
}

/** Page numbers to show: first, last, and the current page with its neighbours. */
export function pageWindow(page: number, totalPages: number): Array<number | 'gap'> {
  const pages = new Set([1, totalPages, page - 1, page, page + 1])
  const sorted = [...pages].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b)
  return sorted.flatMap((n, i) => (i > 0 && n - sorted[i - 1] > 1 ? ['gap' as const, n] : [n]))
}

const item =
  'inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full px-3 font-medium'

/** Server-rendered pagination: plain links, so it works without JavaScript. */
export function Pagination({ page, totalPages, hrefForPage, className }: Props) {
  if (totalPages <= 1) return null

  return (
    <nav aria-label="Pagination" className={cn('flex justify-center', className)}>
      <ul className="flex flex-wrap items-center gap-1">
        <li>
          {page > 1 ? (
            <Link
              href={hrefForPage(page - 1)}
              className={cn(item, 'text-accent hover:bg-accent-tint')}
            >
              <ArrowLeftIcon className="size-4" />
              Previous<span className="sr-only"> page</span>
            </Link>
          ) : (
            <span className={cn(item, 'text-muted opacity-60')} aria-hidden="true">
              <ArrowLeftIcon className="size-4" />
              Previous
            </span>
          )}
        </li>
        {pageWindow(page, totalPages).map((n, i) => (
          <li key={n === 'gap' ? `gap-${i}` : n}>
            {n === 'gap' ? (
              <span className={cn(item, 'text-muted')} aria-hidden="true">
                …
              </span>
            ) : (
              <Link
                href={hrefForPage(n)}
                aria-current={n === page ? 'page' : undefined}
                className={cn(
                  item,
                  n === page ? 'bg-accent text-white' : 'text-ink hover:bg-accent-tint',
                )}
              >
                <span className="sr-only">Page </span>
                {n}
              </Link>
            )}
          </li>
        ))}
        <li>
          {page < totalPages ? (
            <Link
              href={hrefForPage(page + 1)}
              className={cn(item, 'text-accent hover:bg-accent-tint')}
            >
              Next<span className="sr-only"> page</span>
              <ArrowRightIcon className="size-4" />
            </Link>
          ) : (
            <span className={cn(item, 'text-muted opacity-60')} aria-hidden="true">
              Next
              <ArrowRightIcon className="size-4" />
            </span>
          )}
        </li>
      </ul>
    </nav>
  )
}
