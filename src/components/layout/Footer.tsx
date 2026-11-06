import Link from 'next/link'

import { RichText } from '@/components/blocks/RichText'
import {
  SOCIAL_LABELS,
  SOCIAL_PLATFORMS,
  SocialIcon,
  type SocialPlatform,
} from '@/components/icons/SocialIcon'
import { Container } from '@/components/layout/Container'
import { MAIN_NAV } from '@/lib/navigation'
import { getSiteSettings } from '@/lib/site-settings'

const isSocialPlatform = (value: string): value is SocialPlatform =>
  (SOCIAL_PLATFORMS as readonly string[]).includes(value)

const footerLink = 'text-ink underline-offset-4 hover:text-accent hover:underline'

/** Site footer; contact details, socials and the value line come from siteSettings. */
export async function Footer() {
  const { contactEmail, footerText, socialLinks } = await getSiteSettings()
  const socials = (socialLinks ?? []).filter((link) => isSocialPlatform(link.platform))

  return (
    <footer className="border-t border-line bg-sand/60">
      <Container className="grid gap-10 py-14 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="max-w-sm">
          <p className="font-serif text-2xl font-semibold tracking-tight">EthicAI</p>
          {footerText ? (
            <RichText data={footerText} className="mt-3 text-base text-muted" />
          ) : (
            <p className="mt-3 text-base text-muted">AI grounded in human dignity.</p>
          )}
          {contactEmail && (
            <p className="mt-4 text-base">
              <a href={`mailto:${contactEmail}`} className={footerLink}>
                {contactEmail}
              </a>
            </p>
          )}
        </div>

        <nav aria-label="Footer">
          <h2 className="font-sans text-sm font-semibold tracking-wide text-muted uppercase">
            Explore
          </h2>
          <ul className="mt-4 space-y-2 text-base">
            {MAIN_NAV.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={footerLink}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {socials.length > 0 && (
          <div>
            <h2 className="font-sans text-sm font-semibold tracking-wide text-muted uppercase">
              Follow
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {socials.map((link) => (
                <li key={link.id ?? link.url}>
                  <a
                    href={link.url}
                    className="inline-flex size-11 items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors hover:border-accent hover:text-accent"
                  >
                    <SocialIcon platform={link.platform} className="size-5" />
                    <span className="sr-only">EthicAI on {SOCIAL_LABELS[link.platform]}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Container>

      <Container>
        <div className="flex flex-col gap-2 border-t border-line py-6 text-sm text-muted sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} EthicAI</p>
          <p>
            <Link href="/privacy-policy" className={footerLink}>
              Privacy policy
            </Link>
          </p>
        </div>
      </Container>
    </footer>
  )
}
