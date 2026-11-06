import type { Metadata } from 'next'
import Image from 'next/image'

import { Container } from '@/components/layout/Container'
import { ButtonLink } from '@/components/ui/Button'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { HERO, INTRO } from '@/content/site-copy'
import { toImage } from '@/lib/media'
import { getTeamMembers } from '@/lib/queries'
import { teamMemberAnchor } from '@/lib/view-models'
import { pageMetadata } from '@/lib/seo'

export const revalidate = 3600

export const metadata: Metadata = pageMetadata({
  title: 'About',
  description:
    'Meet the EthicAI team: operations, people and culture, and digital leaders helping organisations adopt AI ethically.',
  path: '/about',
})

export default async function AboutPage() {
  const team = await getTeamMembers()

  return (
    <>
      <Container className="py-16 sm:py-24">
        <p className="mb-3 text-sm font-semibold tracking-wide text-accent uppercase">About us</p>
        <h1 className="max-w-3xl text-5xl sm:text-6xl">{HERO.headline}</h1>
        <p className="mt-8 max-w-3xl text-lg sm:text-xl">{INTRO}</p>
      </Container>

      <section aria-labelledby="our-team" className="border-t border-line py-16 sm:py-20">
        <Container>
          <SectionHeading id="our-team" title="Our team" />
          {team.length === 0 ? (
            <p className="mt-8 text-muted">Team profiles are coming soon.</p>
          ) : (
            <ul className="mt-12 space-y-16">
              {team.map((member) => {
                const photo = toImage(member.photo, 'card')
                const paragraphs = member.bio.split(/\n\s*\n/).filter((p) => p.trim())
                return (
                  <li
                    key={member.id}
                    id={teamMemberAnchor(member.name)}
                    className="grid scroll-mt-28 gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-12"
                  >
                    <div className="relative aspect-square max-w-sm overflow-hidden rounded-card bg-sand">
                      {photo && (
                        <Image
                          src={photo.url}
                          alt={photo.alt}
                          fill
                          sizes="(min-width: 768px) 33vw, 100vw"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="text-3xl">{member.name}</h3>
                      <p className="mt-1 font-medium text-accent">{member.role}</p>
                      <div className="mt-5 max-w-reading space-y-4">
                        {paragraphs.map((paragraph, i) => (
                          <p key={i}>{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Container>
      </section>

      <section aria-labelledby="work-with-us" className="bg-sand py-16 sm:py-20">
        <Container className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 id="work-with-us" className="text-3xl sm:text-4xl">
              Work with us
            </h2>
            <p className="mt-3 text-muted">
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
