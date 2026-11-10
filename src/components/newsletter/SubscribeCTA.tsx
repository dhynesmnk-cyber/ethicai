import { PhotoBand } from '@/components/family/PhotoBand'
import { Container } from '@/components/layout/Container'
import { ButtonLink } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { photoFor } from '@/lib/photography'
import { getPageCopy } from '@/lib/queries'
import { getSiteSettings, subscribeHref } from '@/lib/site-settings'

type Props = {
  /**
   * `band`: full-width photo band (end of Home). `inline`: compact box (end of an article).
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
      <aside aria-label="Newsletter" className={cn('rounded-card bg-mist p-6 sm:p-8', className)}>
        <h2 className="text-2xl">{heading}</h2>
        <p className="mt-2 text-muted">{body}</p>
        <ButtonLink href={href} className="mt-6">
          {label}
        </ButtonLink>
      </aside>
    )
  }

  // The closing band over a photograph, as selma.au ends its page.
  const copy = await getPageCopy()
  return (
    <PhotoBand
      photo={photoFor(copy, 'closing')}
      label="Newsletter"
      align="center"
      className={className}
    >
      <h2 className="max-w-2xl text-[clamp(2rem,5vw,3.25rem)] text-white">{heading}</h2>
      <p className="mt-4 max-w-xl text-lg text-white/85">{body}</p>
      <ButtonLink href={href} variant="light" size="lg" className="mt-8">
        {label}
      </ButtonLink>
    </PhotoBand>
  )
}
