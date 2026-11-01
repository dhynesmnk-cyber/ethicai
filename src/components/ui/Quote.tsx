import { cn } from '@/lib/cn'

type Props = {
  quote: string
  attribution: string
  organisation?: string | null
  /** `md` suits several quotes side by side; `lg` a single feature quote. */
  size?: 'md' | 'lg'
  className?: string
}

/** A testimonial or pull quote with its attribution. */
export function Quote({ quote, attribution, organisation, size = 'lg', className }: Props) {
  return (
    <figure className={cn('flex flex-col gap-4', className)}>
      <blockquote
        className={cn(
          'font-serif leading-relaxed text-ink',
          size === 'lg' ? 'text-xl sm:text-2xl' : 'text-lg',
        )}
      >
        <p>
          <span aria-hidden="true">“</span>
          {quote}
          <span aria-hidden="true">”</span>
        </p>
      </blockquote>
      <figcaption className="mt-auto text-muted">
        <span aria-hidden="true">— </span>
        <span className="font-medium text-ink">{attribution}</span>
        {organisation && <>, {organisation}</>}
      </figcaption>
    </figure>
  )
}
