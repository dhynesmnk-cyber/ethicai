import { Container } from '@/components/layout/Container'
import { ButtonLink } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { getSiteSettings, subscribeHref } from '@/lib/site-settings'

type Props = {
  /**
   * `band`: full-width section (end of Home). `inline`: compact box (end of an article).
   * `slim`: a one-line strip (middle of Home).
   */
  variant?: 'band' | 'inline' | 'slim'
  className?: string
}

const heading = 'Thoughtful AI, in your inbox each week'
const body =
  'A short weekly note on adopting AI with people at the centre: what we’re seeing, reading and recommending.'

/**
 * Newsletter call to action (BUILD-SPEC §5.1). A plain link to Substack, never Substack's
 * embed script, so it costs no third-party JavaScript.
 */
export async function SubscribeCTA({ variant = 'band', className }: Props) {
  const { substackPublicationUrl } = await getSiteSettings()
  const href = subscribeHref(substackPublicationUrl)
  const label = substackPublicationUrl ? 'Subscribe on Substack' : 'Subscribe'

  if (variant === 'slim') {
    return (
      <aside
        aria-label="Subscribe to the newsletter"
        className={cn('border-y border-line bg-accent-tint', className)}
      >
        <Container className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-medium text-ink">
            A short weekly note on AI with people at the centre.
          </p>
          <ButtonLink href={href} className="shrink-0 self-start sm:self-auto">
            {label}
          </ButtonLink>
        </Container>
      </aside>
    )
  }

  if (variant === 'inline') {
    return (
      <aside
        aria-label="Newsletter"
        className={cn('rounded-card border border-line bg-sand p-6 sm:p-8', className)}
      >
        <h2 className="text-2xl">{heading}</h2>
        <p className="mt-2 text-muted">{body}</p>
        <ButtonLink href={href} className="mt-5">
          {label}
        </ButtonLink>
      </aside>
    )
  }

  return (
    <section aria-label="Newsletter" className={cn('bg-sand py-16 sm:py-20', className)}>
      <Container className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <h2 className="text-3xl sm:text-4xl">{heading}</h2>
          <p className="mt-3 text-muted">{body}</p>
        </div>
        <ButtonLink href={href} size="lg" className="shrink-0">
          {label}
        </ButtonLink>
      </Container>
    </section>
  )
}
