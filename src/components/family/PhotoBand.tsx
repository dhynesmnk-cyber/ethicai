import type { ReactNode } from 'react'

import { Photo } from '@/components/family/Photo'
import { Container } from '@/components/layout/Container'
import { cn } from '@/lib/cn'
import type { Photo as PhotoData } from '@/lib/photography'

type Props = {
  photo: PhotoData
  /** Id of the heading inside, for aria-labelledby. */
  labelledBy?: string
  label?: string
  /** `start`: text low on the left, as the hero. `center`: centred, as selma.au's closing band. */
  align?: 'start' | 'center'
  className?: string
  children: ReactNode
}

/**
 * A full-width photograph with text over it, under a dark fade so white text stays readable:
 * the Meet Selma band and the newsletter band at the end of Home.
 */
export function PhotoBand({
  photo,
  labelledBy,
  label,
  align = 'start',
  className,
  children,
}: Props) {
  return (
    <section
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : label}
      className={cn(
        'on-night relative isolate flex min-h-[32rem] flex-col justify-end overflow-hidden sm:min-h-[38rem]',
        className,
      )}
    >
      <Photo photo={photo} className="-z-10" />
      <div
        aria-hidden="true"
        className={cn(
          'absolute inset-0 -z-10',
          align === 'center'
            ? 'bg-night/55'
            : 'bg-linear-to-t from-night/90 via-night/45 via-55% to-night/5',
        )}
      />
      <Container
        className={cn(
          'relative py-16 sm:py-24',
          align === 'center' && 'flex flex-col items-center text-center',
        )}
      >
        {children}
      </Container>
    </section>
  )
}
