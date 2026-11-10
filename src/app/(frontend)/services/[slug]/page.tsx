import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { FaqList } from '@/components/family/FaqList'
import { PageIntro } from '@/components/family/PageIntro'
import { RichText } from '@/components/blocks/RichText'
import { ArrowRightIcon } from '@/components/icons'
import { JsonLd } from '@/components/JsonLd'
import { Container } from '@/components/layout/Container'
import { ButtonLink } from '@/components/ui/Button'
import { Prose } from '@/components/ui/Prose'
import { photoFor } from '@/lib/photography'
import { getPageCopy, getServiceBySlug, getServices } from '@/lib/queries'
import { pageMetadata } from '@/lib/seo'
import { faqSchema, serviceSchema } from '@/lib/structured-data'

type Props = { params: Promise<{ slug: string }> }

// Static at build time, refreshed hourly and when a service is saved.
export const revalidate = 3600

export async function generateStaticParams() {
  const services = await getServices()
  return services.filter((s) => s.slug).map((s) => ({ slug: s.slug as string }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await getServiceBySlug((await params).slug)
  if (!service) return {}
  return pageMetadata({
    title: service.title,
    description: service.summary,
    path: `/services/${service.slug}`,
  })
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params
  const service = await getServiceBySlug(slug)
  if (!service) notFound()

  const [all, copy] = await Promise.all([getServices(), getPageCopy()])
  const others = all.filter((s) => s.id !== service.id)
  const path = `/services/${service.slug}`
  const faq = service.faq ?? []

  return (
    <>
      <PageIntro
        path={path}
        title={service.title}
        lead={service.summary}
        photo={photoFor(copy, 'services')}
        parents={[{ name: 'Services', path: '/services' }]}
        actions={
          <ButtonLink href="/contact" size="lg">
            Talk to us about this
          </ButtonLink>
        }
      />
      <JsonLd data={[serviceSchema(service), ...(faq.length ? [faqSchema(path, faq)] : [])]} />

      <Container width="reading" className="py-20 sm:py-24">
        <Prose>
          <RichText data={service.body} />
        </Prose>

        {faq.length > 0 && (
          <section aria-labelledby="service-faq" className="mt-16">
            <h2 id="service-faq" className="text-3xl">
              Questions
            </h2>
            <FaqList items={faq} className="mt-6" />
          </section>
        )}

        <aside aria-label="Get in touch" className="mt-16 border-t border-line-strong/50 pt-10">
          <h2 className="text-2xl sm:text-3xl">Is this right for your organisation?</h2>
          <p className="mt-3 text-muted">
            Tell us what you’re working on and we’ll suggest the right first step.
          </p>
          <ButtonLink href="/contact" className="mt-6">
            Get in touch
          </ButtonLink>
        </aside>
      </Container>

      {others.length > 0 && (
        <nav aria-labelledby="more-services" className="border-t border-line bg-mist py-16">
          <Container>
            <h2 id="more-services" className="text-2xl">
              More services
            </h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((other) => (
                <li key={other.id}>
                  <Link
                    href={`/services/${other.slug}`}
                    className="group flex items-center justify-between gap-4 rounded-card border border-line bg-surface p-5 font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
                  >
                    {other.title}
                    <ArrowRightIcon className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </nav>
      )}
    </>
  )
}
