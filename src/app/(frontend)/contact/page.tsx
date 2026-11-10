import type { Metadata } from 'next'

import { ContactForm } from '@/components/ContactForm'
import { PageIntro } from '@/components/family/PageIntro'
import { Container } from '@/components/layout/Container'
import { displayHost, selmaInfo } from '@/lib/family'
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
  const settings = await getSiteSettings()
  const { contactEmail } = settings
  const selma = selmaInfo(settings)

  return (
    <>
      <PageIntro
        path="/contact"
        title="Contact us"
        eyebrow="Work with us"
        lead="Thinking about AI in your organisation, or want to talk about something you’ve seen us share? Send us a message."
        type="ContactPage"
      />
      <Container className="grid gap-12 py-20 sm:py-24 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div>
          <h2 className="text-3xl sm:text-4xl">Start a conversation</h2>
          <p className="mt-4 text-lg text-muted">
            Tell us a little about your organisation and what you’re working on, and we’ll be in
            touch.
          </p>
          {contactEmail && (
            <p className="mt-8">
              Prefer email? Write to{' '}
              <a
                href={`mailto:${contactEmail}`}
                className="font-semibold text-accent underline underline-offset-4"
              >
                {contactEmail}
              </a>
              .
            </p>
          )}
          <p className="mt-8 text-muted">
            Interested in Selma, our local AI? Join the waitlist on{' '}
            <a
              href={selma.waitlistUrl}
              className="font-semibold text-accent underline underline-offset-4"
            >
              {displayHost(selma.url)}
            </a>
            .
          </p>
        </div>
        <div className="rounded-card border border-line bg-mist p-6 sm:p-8">
          <ContactForm contactEmail={contactEmail} />
        </div>
      </Container>
    </>
  )
}
