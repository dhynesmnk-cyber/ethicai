import { RingMark } from '@/components/family/RingMark'
import { Container } from '@/components/layout/Container'
import { ButtonLink } from '@/components/ui/Button'
import { displayHost, type SelmaInfo } from '@/lib/family'

/**
 * "Meet Selma" on Home: the family's product, presented in Selma's own night-and-glass style,
 * with the Human at the Helm™ Suite as cards and links out to selma.au. Server-rendered.
 */
export function SelmaShowcase({ selma }: { selma: SelmaInfo }) {
  if (!selma.show) return null
  const host = displayHost(selma.url)

  return (
    <section
      aria-labelledby="meet-selma"
      className="on-night grain relative isolate overflow-hidden py-24 sm:py-32"
    >
      <div className="aurora -z-10 opacity-80" />
      <RingMark
        animated
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 size-[44rem] -translate-x-1/2 text-accent-soft opacity-20"
      />
      <Container className="relative">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow text-accent-soft">Selma by EthicAI</p>
          <h2
            id="meet-selma"
            className="mt-5 text-[clamp(2.5rem,7vw,5rem)] leading-none text-white"
          >
            Meet Selma.
          </h2>
          {selma.tagline && (
            <p className="mt-4 text-2xl font-light text-white/80 sm:text-3xl">{selma.tagline}</p>
          )}
          {selma.summary && <p className="mt-8 text-lg text-night-muted">{selma.summary}</p>}
        </div>

        {selma.suite.length > 0 && (
          <div className="mt-16">
            <h3 className="text-center text-xl text-white">
              The Human at the Helm<span className="align-super text-[0.6em] opacity-70">™</span>{' '}
              Suite
            </h3>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {selma.suite.map((part) => (
                <li key={part.name} className="glass reveal rounded-card p-6 text-left">
                  <p className="text-lg font-bold text-white">{part.name}</p>
                  {part.kicker && (
                    <p className="mt-1 text-sm font-medium text-accent-soft">{part.kicker}</p>
                  )}
                  <p className="mt-3 text-sm leading-relaxed text-night-muted">
                    {part.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          <ButtonLink href={selma.waitlistUrl} size="lg">
            Join the Selma waitlist
          </ButtonLink>
          <a
            href={selma.url}
            className="inline-flex items-center gap-1.5 border-b border-white/40 pb-0.5 font-semibold text-white/85 transition-colors hover:border-white hover:text-white"
          >
            Visit {host}
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </Container>
    </section>
  )
}
