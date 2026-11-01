import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

// DECISION: hand-written `.prose` styles in globals.css instead of @tailwindcss/typography;
// the article editor only produces a handful of elements, so a plugin isn't worth the weight.

/** Typographic wrapper for long-form rich text, capped at a ~68ch reading width. */
export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('prose', className)}>{children}</div>
}
