import Link from 'next/link'

import { cn } from '@/lib/cn'

export type Crumb = { name: string; path: string }

/**
 * Visible breadcrumbs, matching the BreadcrumbList structured data on the same page. The last
 * item is the current page.
 */
export function Breadcrumbs({
  items,
  tone = 'light',
  className,
}: {
  items: Crumb[]
  tone?: 'light' | 'dark'
  className?: string
}) {
  const dark = tone === 'dark'
  return (
    <nav aria-label="Breadcrumb" className={cn('text-sm', className)}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => {
          const last = index === items.length - 1
          return (
            <li key={item.path} className="flex items-center gap-2">
              {last ? (
                <span aria-current="page" className={dark ? 'text-white/85' : 'text-muted'}>
                  {item.name}
                </span>
              ) : (
                <>
                  <Link
                    href={item.path}
                    className={cn(
                      'rounded-sm font-medium underline-offset-4',
                      dark
                        ? 'text-white underline decoration-white/40 hover:decoration-white'
                        : 'text-accent hover:underline',
                    )}
                  >
                    {item.name}
                  </Link>
                  <span aria-hidden="true" className={dark ? 'text-white/50' : 'text-line-strong'}>
                    /
                  </span>
                </>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
