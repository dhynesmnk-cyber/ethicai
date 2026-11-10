import Link from 'next/link'

import { ArrowRightIcon } from '@/components/icons'
import { Container } from '@/components/layout/Container'
import { displayHost, selmaInfo } from '@/lib/family'
import { getSiteSettings } from '@/lib/site-settings'

/**
 * The thin dark strip above the header that shows EthicAI and Selma as one family, with an
 * optional announcement (both edited in Site settings → Selma & family). Server-rendered, no JS.
 */
export async function FamilyBar() {
  const settings = await getSiteSettings()
  const selma = selmaInfo(settings)
  if (!selma.show) return null

  const announcement = settings.announcement
  const showAnnouncement = Boolean(announcement?.enabled && announcement.text)

  return (
    <aside aria-label="The EthicAI family" className="on-night relative z-50 text-sm">
      <Container className="flex min-h-9 items-center justify-between gap-4 py-1.5">
        <ul className="flex shrink-0 items-center gap-1 font-semibold">
          <li>
            <Link href="/" className="rounded-sm px-1 text-white">
              EthicAI
            </Link>
          </li>
          <li aria-hidden="true" className="text-night-muted">
            ·
          </li>
          <li>
            <a
              href={selma.url}
              className="inline-flex items-center gap-1 rounded-sm px-1 text-night-muted transition-colors hover:text-white"
            >
              Selma
              <span className="text-accent-soft" aria-hidden="true">
                ↗
              </span>
              <span className="sr-only"> (opens {displayHost(selma.url)})</span>
            </a>
          </li>
        </ul>
        {showAnnouncement && (
          <p className="min-w-0 truncate text-right text-night-muted">
            <span className="sr-only sm:not-sr-only">{announcement?.text} </span>
            {announcement?.linkUrl && (
              <a
                href={announcement.linkUrl}
                className="inline-flex items-center gap-1 rounded-sm font-semibold text-white underline decoration-accent-soft underline-offset-4 hover:text-accent-soft"
              >
                {announcement.linkLabel || 'Find out more'}
                <ArrowRightIcon className="size-3.5" />
              </a>
            )}
          </p>
        )}
      </Container>
    </aside>
  )
}
