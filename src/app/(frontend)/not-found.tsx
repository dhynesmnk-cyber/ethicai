import type { Metadata } from 'next'

import { Container } from '@/components/layout/Container'
import { ButtonLink } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Page not found',
}

export default function NotFound() {
  return (
    <Container width="reading" className="py-20 sm:py-28">
      <p className="text-sm font-semibold tracking-wide text-accent uppercase">404</p>
      <h1 className="mt-3 text-4xl sm:text-5xl">Page not found</h1>
      <p className="mt-6 text-lg text-muted">
        Sorry, we couldn’t find that page. It may have moved, or the link may be wrong.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink href="/">Back to the home page</ButtonLink>
        <ButtonLink href="/articles" variant="secondary">
          Browse articles
        </ButtonLink>
      </div>
    </Container>
  )
}
