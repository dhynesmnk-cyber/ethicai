import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

type Props = {
  children: ReactNode
  className?: string
  as?: 'div' | 'section' | 'header' | 'footer' | 'article'
  /** `reading` narrows to a comfortable reading width (~68ch). */
  width?: 'content' | 'reading'
}

/** Centres content with the site's side gutters: 16px on phones, wider from tablet up. */
export function Container({ children, className, as: Tag = 'div', width = 'content' }: Props) {
  return (
    <Tag
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        width === 'content' ? 'max-w-content' : 'max-w-reading',
        className,
      )}
    >
      {children}
    </Tag>
  )
}
