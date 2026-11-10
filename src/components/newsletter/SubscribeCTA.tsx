import { RingMark } from '@/components/family/RingMark'
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
        className={cn('border-y border-line bg-mist', className)}
      >
        <Container className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold text-ink">
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
        className={cn(
          'relative overflow-hidden rounded-card bg-accent p-6 text-white sm:p-8',
          className,
        )}
      >
        <p className="eyebrow text-white/85">The weekly note</p>
        <h2 className="mt-3 text-2xl text-white">{heading}</h2>
        <p className="mt-2 text-white/80">{body}</p>
        <ButtonLink href={href} variant="light" className="mt-6">
          {label}
        </ButtonLink>
      </aside>
    )
  }

  // The full-width indigo band, as selma.au's promo band.
  return (
    <section
      aria-label="Newsletter"
      className={cn('relative overflow-hidden bg-accent py-16 text-white sm:py-24', className)}
    >
      <RingMark className="pointer-events-none absolute top-1/2 -left-40 size-[28rem] -translate-y-1/2 text-white opacity-10" />
      <Container className="relative flex flex-col items-center text-center">
        <p className="eyebrow text-white/85">The weekly note</p>
        <h2 className="mt-4 max-w-2xl text-3xl text-white sm:text-[2.5rem]">{heading}</h2>
        <p className="mt-4 max-w-xl text-lg text-white/80">{body}</p>
        <ButtonLink href={href} variant="light" size="lg" className="mt-8">
          {label}
        </ButtonLink>
      </Container>
    </section>
  )
}
