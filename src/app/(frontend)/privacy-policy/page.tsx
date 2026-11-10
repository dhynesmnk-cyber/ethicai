import type { Metadata } from 'next'
import Link from 'next/link'

import { PageIntro } from '@/components/family/PageIntro'
import { Container } from '@/components/layout/Container'
import { Prose } from '@/components/ui/Prose'
import { getSiteSettings } from '@/lib/site-settings'
import { pageMetadata } from '@/lib/seo'

// TEMPLATE for client review (BUILD-SPEC §5.8). Not legal advice: EthicAI should have it checked
// before launch. The analytics section follows the choice in Site settings.

export const revalidate = 3600

export const metadata: Metadata = pageMetadata({
  title: 'Privacy policy',
  description: 'How EthicAI collects, uses and looks after personal information.',
  path: '/privacy-policy',
})

const LAST_UPDATED = '1 November 2026'

function AnalyticsSection({ analytics }: { analytics: string | null | undefined }) {
  if (analytics === 'plausible') {
    return (
      <p>
        We use Plausible Analytics to understand how the site is used, such as which pages are
        visited. Plausible doesn’t use cookies and doesn’t collect information that identifies you;
        it reports totals only.
      </p>
    )
  }
  if (analytics === 'ga4') {
    return (
      <p>
        With your consent, we use Google Analytics to understand how the site is used. It sets
        cookies and sends information about your visit, such as pages viewed and your approximate
        location, to Google. You can say no, or change your mind, using the cookie banner.
      </p>
    )
  }
  return <p>We don’t use analytics or tracking cookies on this site.</p>
}

export default async function PrivacyPolicyPage() {
  const { analytics, contactEmail } = await getSiteSettings()
  const contact = contactEmail ? (
    <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
  ) : (
    <Link href="/contact">our contact form</Link>
  )

  return (
    <>
      <PageIntro
        path="/privacy-policy"
        title="Privacy policy"
        lead={`Last updated ${LAST_UPDATED}`}
      />
      <Container width="reading" className="py-16 sm:py-20">
        <Prose>
          <p>
            EthicAI respects your privacy. This policy explains what personal information we collect
            through this website, how we use it and the choices you have. We handle personal
            information in line with the Australian Privacy Principles in the{' '}
            <em>Privacy Act 1988</em> (Cth).
          </p>

          <h2>What we collect</h2>
          <h3>When you contact us</h3>
          <p>
            If you use our contact form, we collect your name, email address and message so we can
            reply. The form is processed and stored by our website host, Netlify.
          </p>
          <h3>When you subscribe to our newsletter</h3>
          <p>
            Our newsletter is published on Substack. When you subscribe, you do so on Substack’s
            website, and Substack collects and manages your email address under its own privacy
            policy.
          </p>
          <h3>Analytics</h3>
          <AnalyticsSection analytics={analytics} />

          <h2>Videos and other embedded content</h2>
          <p>
            Our videos are hosted on YouTube and TikTok. To protect your privacy, nothing loads from
            them until you choose to play a video or load the feed:
          </p>
          <ul>
            <li>
              YouTube videos load from YouTube’s privacy-enhanced domain (youtube-nocookie.com) when
              you press play.
            </li>
            <li>
              Our TikTok feed on the Watch page is provided by Elfsight and loads only when you ask
              for it.
            </li>
          </ul>
          <p>
            Once loaded, these services may collect information about your visit under their own
            privacy policies.
          </p>

          <h2>How we use your information</h2>
          <p>
            We use personal information only to respond to you, to provide information you’ve asked
            for and to improve our website. We don’t sell personal information.
          </p>

          <h2>Overseas service providers</h2>
          <p>
            Our website and tools are provided by companies that may store information outside
            Australia, including in the United States: Netlify (hosting and forms), Cloudflare
            (image storage), Substack (newsletter), Google (YouTube) and Elfsight (TikTok feed).
          </p>

          <h2>Accessing or correcting your information</h2>
          <p>
            You can ask to see or correct the personal information we hold about you by contacting
            us at {contact}.
          </p>

          <h2>Complaints</h2>
          <p>
            If you’re concerned about how we’ve handled your personal information, please contact us
            at {contact} and we’ll respond as soon as we can. If you’re not satisfied with our
            response, you can contact the Office of the Australian Information Commissioner at{' '}
            <a href="https://www.oaic.gov.au">oaic.gov.au</a>.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            We may update this policy from time to time. The date at the top shows when it last
            changed.
          </p>
        </Prose>
      </Container>
    </>
  )
}
