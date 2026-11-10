import { Photo } from '@/components/family/Photo'
import { Container } from '@/components/layout/Container'
import { ButtonLink } from '@/components/ui/Button'
import { displayHost, type SelmaInfo } from '@/lib/family'
import type { Photo as PhotoData } from '@/lib/photography'

/**
 * "Meet Selma" on Home: the family's product, introduced over a photograph the way selma.au
 * introduces it, then the Human at the Helm™ Suite as a plain list and links out to selma.au.
 * Server-rendered.
 */
export function SelmaShowcase({ selma, photo }: { selma: SelmaInfo; photo: PhotoData }) {
  if (!selma.show) return null
  const host = displayHost(selma.url)

  return (
    <section aria-labelledby="meet-selma" className="on-night">
      <div className="relative isolate flex min-h-[32rem] flex-col justify-end overflow-hidden sm:min-h-[40rem]">
        <Photo photo={photo} className="-z-10" />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-linear-to-t from-night via-night/45 via-50% to-night/5"
        />
        <Container className="relative pt-24 pb-14 sm:pb-20">
          <p className="text-lg font-medium text-white/85">Selma by EthicAI</p>
          <h2
            id="meet-selma"
            className="mt-3 text-[clamp(2.75rem,8vw,5.5rem)] leading-none text-white"
          >
            Meet Selma.
          </h2>
          {selma.tagline && (
            <p className="mt-4 text-2xl font-light text-white/85 sm:text-3xl">{selma.tagline}</p>
          )}
          {selma.summary && <p className="mt-6 max-w-2xl text-lg text-white/80">{selma.summary}</p>}
        </Container>
      </div>

      <Container className="pt-6 pb-20 sm:pb-28">
        {selma.suite.length > 0 && (
          <>
            <h3 className="text-xl text-white">
              The Human at the Helm<span className="align-super text-[0.6em] opacity-70">™</span>{' '}
              Suite
            </h3>
            <ul className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
              {selma.suite.map((part) => (
                <li key={part.name} className="border-t border-white/20 pt-5">
                  <p className="text-lg font-bold text-white">{part.name}</p>
                  {part.kicker && <p className="mt-1 text-sm text-white/70">{part.kicker}</p>}
                  <p className="mt-3 text-sm leading-relaxed text-night-muted">
                    {part.description}
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-4">
          <ButtonLink href={selma.waitlistUrl} size="lg">
            Join the Selma waitlist
          </ButtonLink>
          <ButtonLink href={selma.url} variant="underline" size="lg">
            Visit {host}
            <span aria-hidden="true">↗</span>
          </ButtonLink>
        </div>
      </Container>
    </section>
  )
}
