import type { Metadata } from 'next'
import Image from 'next/image'

import { PageIntro } from '@/components/family/PageIntro'
import { RingMark } from '@/components/family/RingMark'
import { SocialIcon } from '@/components/icons/SocialIcon'
import { JsonLd } from '@/components/JsonLd'
import { Container } from '@/components/layout/Container'
import { ButtonLink } from '@/components/ui/Button'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { displayHost, selmaInfo } from '@/lib/family'
import { toImage } from '@/lib/media'
import { getPageCopy, getTeamMembers } from '@/lib/queries'
import { pageMetadata } from '@/lib/seo'
import { getSiteSettings } from '@/lib/site-settings'
import { personSchema } from '@/lib/structured-data'
import { teamMemberAnchor } from '@/lib/view-models'

export const revalidate = 3600

export const metadata: Metadata = pageMetadata({
  title: 'About',
  description:
    'EthicAI is a Sydney-based AI ethics and governance consultancy and the maker of Selma. Meet the team helping organisations adopt AI ethically.',
  path: '/about',
})

const paragraphs = (text: string | null | undefined) =>
  (text ?? '').split(/\n\s*\n/).filter((p) => p.trim())

export default async function AboutPage() {
  const [copy, team, settings] = await Promise.all([
    getPageCopy(),
    getTeamMembers(),
    getSiteSettings(),
  ])
  const about = copy.about
  const selma = selmaInfo(settings)

  return (
    <>
      <PageIntro
        path="/about"
        title={about?.headline || 'About EthicAI'}
        eyebrow="Who we are"
        lead={about?.lead}
        type="AboutPage"
      />
      <JsonLd data={team.map((member) => personSchema(member, toImage(member.photo, 'card')))} />

      {paragraphs(about?.story).length > 0 && (
        <section aria-labelledby="our-story" className="py-24 sm:py-28">
          <Container className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
            <SectionHeading id="our-story" eyebrow="Our story" title="Adaptable by design" />
            <div className="space-y-6 text-xl leading-relaxed text-ink">
              {paragraphs(about?.story).map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </Container>
        </section>
      )}

      <section aria-labelledby="our-team" className="py-24 sm:py-28">
        <Container>
          <SectionHeading id="our-team" eyebrow="People" title="Our team" />
          {team.length === 0 ? (
            <p className="mt-8 text-muted">Team profiles are coming soon.</p>
          ) : (
            <ul className="mt-14 space-y-20">
              {team.map((member) => {
                const photo = toImage(member.photo, 'card')
                return (
                  <li
                    key={member.id}
                    id={teamMemberAnchor(member.name)}
                    className="grid scroll-mt-28 gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-14"
                  >
                    <div className="relative aspect-[4/5] max-w-sm overflow-hidden rounded-card bg-mist">
                      {photo && (
                        <Image
                          src={photo.url}
                          alt={photo.alt}
                          fill
                          sizes="(min-width: 768px) 40vw, 100vw"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="text-3xl sm:text-4xl">{member.name}</h3>
                      <p className="mt-2 font-semibold text-accent">{member.role}</p>
                      <div className="mt-6 max-w-reading space-y-4">
                        {paragraphs(member.bio).map((paragraph, i) => (
                          <p key={i}>{paragraph}</p>
                        ))}
                      </div>
                      {member.credentials && member.credentials.length > 0 && (
                        <>
                          <h4 className="eyebrow mt-8 text-muted">Qualifications</h4>
                          <ul className="mt-3 flex flex-wrap gap-2">
                            {member.credentials.map((credential) => (
                              <li
                                key={credential}
                                className="rounded-full bg-accent-tint px-3 py-1 text-sm font-medium text-accent"
                              >
                                {credential}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                      {member.linkedinUrl && (
                        <p className="mt-6">
                          <a
                            href={member.linkedinUrl}
                            className="inline-flex items-center gap-2 font-semibold text-accent underline-offset-4 hover:underline"
                          >
                            <SocialIcon platform="linkedin" className="size-5" />
                            {member.name} on LinkedIn
                          </a>
                        </p>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Container>
      </section>

      {selma.show && (
        <section
          aria-labelledby="selma-family"
          className="on-night grain relative isolate overflow-hidden py-24"
        >
          <div className="aurora -z-10 opacity-70" />
          <RingMark className="pointer-events-none absolute top-1/2 right-[-8rem] -z-10 size-[30rem] -translate-y-1/2 text-accent-soft opacity-25" />
          <Container className="max-w-3xl">
            <p className="eyebrow text-accent-soft">The EthicAI family</p>
            <h2 id="selma-family" className="mt-4 text-4xl text-white sm:text-5xl">
              Selma is our knowledge, productised.
            </h2>
            {selma.summary && <p className="mt-6 text-lg text-night-muted">{selma.summary}</p>}
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <ButtonLink href={selma.url} size="lg">
                Visit {displayHost(selma.url)}
              </ButtonLink>
              <ButtonLink href={selma.waitlistUrl} variant="underline" size="lg">
                Join the waitlist
              </ButtonLink>
            </div>
          </Container>
        </section>
      )}

      <section aria-labelledby="work-with-us" className="bg-mist py-20 sm:py-24">
        <Container className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 id="work-with-us" className="text-3xl sm:text-4xl">
              Work with us
            </h2>
            <p className="mt-3 text-lg text-muted">
              Thinking about AI in your organisation? We’d love to hear what you’re working on.
            </p>
          </div>
          <ButtonLink href="/contact" size="lg" className="shrink-0">
            Get in touch
          </ButtonLink>
        </Container>
      </section>
    </>
  )
}
