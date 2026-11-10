import type { Metadata } from 'next'
import Link from 'next/link'

import { NumberedSteps } from '@/components/family/NumberedSteps'
import { PageIntro } from '@/components/family/PageIntro'
import { ArrowRightIcon } from '@/components/icons'
import { JsonLd } from '@/components/JsonLd'
import { Container } from '@/components/layout/Container'
import { ButtonLink } from '@/components/ui/Button'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { displayHost, selmaInfo } from '@/lib/family'
import { photoFor } from '@/lib/photography'
import { getPageCopy, getServices } from '@/lib/queries'
import { pageMetadata } from '@/lib/seo'
import { getSiteSettings } from '@/lib/site-settings'
import { serviceSchema } from '@/lib/structured-data'

export const revalidate = 3600

export const metadata: Metadata = pageMetadata({
  title: 'Services',
  description:
    'AI readiness diagnostics, consulting, education and public sector insight from EthicAI, the Sydney AI ethics and governance consultancy behind Selma.',
  path: '/services',
})

export default async function ServicesPage() {
  const [copy, services, settings] = await Promise.all([
    getPageCopy(),
    getServices(),
    getSiteSettings(),
  ])
  const selma = selmaInfo(settings)

  return (
    <>
      <PageIntro
        path="/services"
        title="Services"
        lead={copy.services?.intro}
        photo={photoFor(copy, 'services')}
        type="CollectionPage"
      />
      <JsonLd data={services.map(serviceSchema)} />

      <section aria-labelledby="all-services" className="py-24 sm:py-28">
        <Container>
          <h2 id="all-services" className="sr-only">
            All services
          </h2>
          {services.length === 0 ? (
            <p className="text-muted">Our services are being updated. Please get in touch.</p>
          ) : (
            <ul className="grid gap-x-12 gap-y-2 md:grid-cols-2">
              {services.map((service) => (
                <li key={service.id} className="flex">
                  <Link
                    href={`/services/${service.slug}`}
                    className="group flex w-full flex-col border-t border-line-strong/50 py-8"
                  >
                    <span className="text-2xl font-bold tracking-[-0.02em] text-ink decoration-2 underline-offset-4 group-hover:underline sm:text-3xl">
                      {service.title}
                    </span>
                    <span className="mt-3 text-lg text-muted">{service.summary}</span>
                    <span className="mt-5 inline-flex items-center gap-1.5 font-semibold text-accent">
                      Learn more
                      <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>

      {(copy.services?.steps?.length ?? 0) > 0 && (
        <section aria-labelledby="how-we-work" className="pb-24 sm:pb-28">
          <Container>
            <SectionHeading id="how-we-work" title="How we work" />
            <NumberedSteps steps={copy.services?.steps ?? []} className="mt-12" />
          </Container>
        </section>
      )}

      {selma.show && (
        <section aria-labelledby="selma-option" className="bg-mist py-20 sm:py-24">
          <Container className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="text-base font-semibold text-muted">Selma by EthicAI</p>
              <h2 id="selma-option" className="mt-2 text-3xl sm:text-4xl">
                Need AI that never leaves your building?
              </h2>
              <p className="mt-3 text-lg text-muted">
                {selma.summary ||
                  'Selma is local AI for organisations that can’t use cloud AI, from the EthicAI team.'}
              </p>
            </div>
            <ButtonLink href={selma.url} size="lg" className="shrink-0">
              Visit {displayHost(selma.url)} <span aria-hidden="true">↗</span>
            </ButtonLink>
          </Container>
        </section>
      )}
    </>
  )
}
