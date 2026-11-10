import type { Metadata } from 'next'

import { Container } from '@/components/layout/Container'
import { ButtonLink } from '@/components/ui/Button'

// Where Netlify Forms sends people who submitted the contact form without JavaScript.
export const metadata: Metadata = {
  title: 'Message sent',
  robots: { index: false, follow: false },
}

export default function ContactThanksPage() {
  return (
    <Container width="reading" className="py-20 sm:py-28">
      <h1 className="text-4xl sm:text-5xl">Thanks for getting in touch</h1>
      <p className="mt-6 text-lg text-muted">Your message is on its way. We’ll be in touch soon.</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink href="/">Back to the home page</ButtonLink>
        <ButtonLink href="/articles" variant="secondary">
          Read our articles
        </ButtonLink>
      </div>
    </Container>
  )
}
