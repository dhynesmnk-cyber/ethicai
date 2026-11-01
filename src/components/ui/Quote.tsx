import { cn } from '@/lib/cn'

type Props = {
  quote: string
  attribution: string
  organisation?: string | null
  className?: string
}

/** A testimonial or pull quote with its attribution. */
export function Quote({ quote, attribution, organisation, className }: Props) {
  return (
    <figure className={cn('flex flex-col gap-4', className)}>
      <blockquote className="font-serif text-xl leading-relaxed text-ink sm:text-2xl">
        <p>
          <span aria-hidden="true">“</span>
          {quote}
          <span aria-hidden="true">”</span>
        </p>
      </blockquote>
      <figcaption className="text-muted">
        <span aria-hidden="true">— </span>
        <span className="font-medium text-ink">{attribution}</span>
        {organisation && <>, {organisation}</>}
      </figcaption>
    </figure>
  )
}
