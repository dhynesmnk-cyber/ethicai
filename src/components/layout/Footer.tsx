import Link from 'next/link'

import { RichText } from '@/components/blocks/RichText'
import {
  SOCIAL_LABELS,
  SOCIAL_PLATFORMS,
  SocialIcon,
  type SocialPlatform,
} from '@/components/icons/SocialIcon'
import { Container } from '@/components/layout/Container'
import { displayHost, selmaInfo } from '@/lib/family'
import { FOOTER_NAV } from '@/lib/navigation'
import { getSiteSettings } from '@/lib/site-settings'

const isSocialPlatform = (value: string): value is SocialPlatform =>
  (SOCIAL_PLATFORMS as readonly string[]).includes(value)

const footerLink =
  'rounded-sm text-night-muted underline-offset-4 transition-colors hover:text-white hover:underline'
const columnHeading = 'text-base font-semibold text-white'

/**
 * Site footer (night). Contact details, socials, the family column, the legal line and the
 * Acknowledgement of Country all come from Site settings.
 */
export async function Footer() {
  const settings = await getSiteSettings()
  const { contactEmail, footerText, socialLinks, organisation } = settings
  const socials = (socialLinks ?? []).filter((link) => isSocialPlatform(link.platform))
  const selma = selmaInfo(settings)
  const legal = [
    organisation?.legalName,
    organisation?.abn && `ABN ${organisation.abn}`,
    organisation?.locality,
  ].filter(Boolean)

  return (
    <footer className="on-night">
      <Container className="grid gap-12 pt-20 pb-14 md:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
        <div className="max-w-sm">
          <p className="text-4xl font-extrabold tracking-[-0.03em]">EthicAI</p>
          {footerText ? (
            <RichText data={footerText} className="mt-4 text-base text-night-muted" />
          ) : (
            <p className="mt-4 text-base text-night-muted">AI grounded in human dignity.</p>
          )}
          {contactEmail && (
            <p className="mt-5 text-base">
              <a href={`mailto:${contactEmail}`} className={footerLink}>
                {contactEmail}
              </a>
            </p>
          )}
          {socials.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="EthicAI on social media">
              {socials.map((link) => (
                <li key={link.id ?? link.url}>
                  <a
                    href={link.url}
                    className="inline-flex size-11 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:border-white/60"
                  >
                    <SocialIcon platform={link.platform} className="size-5" />
                    <span className="sr-only">EthicAI on {SOCIAL_LABELS[link.platform]}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <nav aria-label="Footer">
          <h2 className={columnHeading}>Explore</h2>
          <ul className="mt-5 space-y-2.5 text-base">
            {FOOTER_NAV.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={footerLink}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {selma.show && (
          <div>
            <h2 className={columnHeading}>The EthicAI family</h2>
            <ul className="mt-5 space-y-4 text-base">
              <li>
                <Link href="/" className="font-semibold text-white">
                  EthicAI
                </Link>
                <p className="text-sm text-night-muted">AI ethics and governance</p>
              </li>
              <li>
                <a
                  href={selma.url}
                  className="font-semibold text-white underline-offset-4 hover:underline"
                >
                  Selma <span aria-hidden="true">↗</span>
                  <span className="sr-only"> (opens {displayHost(selma.url)})</span>
                </a>
                {selma.tagline && <p className="text-sm text-night-muted">{selma.tagline}</p>}
              </li>
            </ul>
          </div>
        )}

        {(organisation?.acknowledgement || organisation?.inclusion) && (
          <div className="md:col-span-2 lg:col-span-1">
            <h2 className={columnHeading}>Acknowledgement of Country</h2>
            {organisation?.acknowledgement && (
              <p className="mt-5 text-sm text-night-muted">{organisation.acknowledgement}</p>
            )}
            {organisation?.inclusion && (
              <p className="mt-3 text-sm text-night-muted">{organisation.inclusion}</p>
            )}
          </div>
        )}
      </Container>

      <Container>
        <div className="flex flex-col gap-2 border-t border-white/10 py-6 text-sm text-night-muted sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {legal.length > 0 ? legal.join(' · ') : 'EthicAI'}
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <Link href="/privacy-policy" className={footerLink}>
                Privacy policy
              </Link>
            </li>
            <li>
              <Link href="/photo-credits" className={footerLink}>
                Photo credits
              </Link>
            </li>
          </ul>
        </div>
      </Container>
    </footer>
  )
}
