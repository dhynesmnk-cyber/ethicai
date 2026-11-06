import type { Metadata } from 'next'

import { ContactForm } from '@/components/ContactForm'
import { Container } from '@/components/layout/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { getSiteSettings } from '@/lib/site-settings'
import { pageMetadata } from '@/lib/seo'

export const revalidate = 3600

export const metadata: Metadata = pageMetadata({
  title: 'Contact',
  description:
    'Get in touch with EthicAI about adopting AI ethically in your organisation: strategy, people and change.',
  path: '/contact',
})

export default async function ContactPage() {
  const { contactEmail } = await getSiteSettings()

  return (
    <Container className="grid gap-12 py-16 sm:py-20 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div>
        <SectionHeading
          as="h1"
          title="Contact us"
          description="Thinking about AI in your organisation, or want to talk about something you’ve seen us share? Send us a message."
        />
        {contactEmail && (
          <p className="mt-8">
            Prefer email? Write to{' '}
            <a
              href={`mailto:${contactEmail}`}
              className="font-medium text-accent underline underline-offset-4"
            >
              {contactEmail}
            </a>
            .
          </p>
        )}
      </div>
      <div className="rounded-card border border-line bg-surface p-6 sm:p-8">
        <ContactForm contactEmail={contactEmail} />
      </div>
    </Container>
  )
}
