import Link from 'next/link'

import { Container } from '@/components/layout/Container'
import { SiteNav } from '@/components/layout/SiteNav'
import { MAIN_NAV, SUBSCRIBE_LINK } from '@/lib/navigation'

/** Sticky site header; the condense-on-scroll effect is pure CSS (see `.site-header`). */
export function Header() {
  return (
    <header className="site-header sticky top-0 z-40 bg-canvas/95 backdrop-blur-sm">
      <Container className="flex h-16 items-center justify-between gap-6 md:h-20">
        {/* TODO: swap the wordmark for the client's logo (SVG) once supplied. */}
        <Link
          href="/"
          className="site-header-logo font-serif text-2xl font-semibold tracking-tight text-ink md:text-[1.75rem]"
        >
          EthicAI<span className="sr-only">, home</span>
        </Link>
        <SiteNav links={MAIN_NAV} subscribe={SUBSCRIBE_LINK} />
      </Container>
    </header>
  )
}
