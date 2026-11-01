import { Container } from '@/components/layout/Container'
import { ButtonLink } from '@/components/ui/Button'

// Placeholder until the real Home page is built in Phase 3 (BUILD-SPEC §5.2).
export default function HomePage() {
  return (
    <Container className="py-20 sm:py-28">
      <div className="max-w-3xl">
        <h1 className="text-5xl sm:text-6xl">A.I. grounded in human dignity</h1>
        <p className="mt-6 max-w-2xl text-lg text-muted sm:text-xl">
          EthicAI helps organisations build the systems, culture and clarity to move with change.
          Our new website is on its way.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/articles" size="lg">
            Read the latest
          </ButtonLink>
          <ButtonLink href="/newsletter" variant="secondary" size="lg">
            Subscribe to the newsletter
          </ButtonLink>
        </div>
      </div>
    </Container>
  )
}
