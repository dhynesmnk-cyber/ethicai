import Link from 'next/link'

import { cn } from '@/lib/cn'

type Props = {
  label: string
  /** Makes the chip a link, e.g. a tag filter on /articles. */
  href?: string
  /** Marks the active filter. */
  current?: boolean
}

const base = 'inline-flex items-center rounded-full px-3 py-1 text-sm leading-snug font-medium'

export function TagChip({ label, href, current = false }: Props) {
  if (!href) {
    return <span className={cn(base, 'bg-accent-tint text-accent')}>{label}</span>
  }
  return (
    <Link
      href={href}
      aria-current={current ? 'true' : undefined}
      className={cn(
        base,
        'min-h-8 transition-colors',
        current
          ? 'bg-accent text-white hover:bg-accent-strong'
          : 'bg-accent-tint text-accent hover:bg-accent hover:text-white',
      )}
    >
      {label}
    </Link>
  )
}
