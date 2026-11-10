import Link from 'next/link'

import { Container } from '@/components/layout/Container'
import { SiteNav } from '@/components/layout/SiteNav'
import { displayHost, selmaInfo } from '@/lib/family'
import { MAIN_NAV, SUBSCRIBE_LINK } from '@/lib/navigation'
import { getSiteSettings } from '@/lib/site-settings'

/**
 * Sticky site header. Frosted glass, or transparent over a dark hero until the page scrolls; both
 * effects are pure CSS (see `.site-header` in globals.css).
 */
export async function Header() {
  const selma = selmaInfo(await getSiteSettings())
  const external = selma.show
    ? { href: selma.url, label: 'Selma', description: `opens ${displayHost(selma.url)}` }
    : undefined

  return (
    <header className="site-header sticky top-0 z-40">
      <Container className="flex h-(--header-height) items-center justify-between gap-6">
        {/* TODO: swap the wordmark for the client's logo (SVG) once supplied. */}
        <Link
          href="/"
          className="site-header-logo rounded-sm text-2xl font-extrabold tracking-[-0.03em] text-(--header-fg)"
        >
          EthicAI<span className="sr-only">, home</span>
        </Link>
        <SiteNav links={MAIN_NAV} external={external} subscribe={SUBSCRIBE_LINK} />
      </Container>
    </header>
  )
}
