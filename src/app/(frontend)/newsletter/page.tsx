import type { Metadata } from 'next'

import { PageIntro } from '@/components/family/PageIntro'
import { ArrowRightIcon } from '@/components/icons'
import { Container } from '@/components/layout/Container'
import { ButtonLink } from '@/components/ui/Button'
import { formatDate } from '@/lib/format'
import { photoFor } from '@/lib/photography'
import { getPageCopy } from '@/lib/queries'
import { getNewsletterIssues } from '@/lib/rss'
import { getSiteSettings, subscribeHref } from '@/lib/site-settings'
import { pageMetadata } from '@/lib/seo'

// The RSS fetch is cached for an hour too; a failed fetch shows the fallback, never an error.
export const revalidate = 3600

export const metadata: Metadata = pageMetadata({
  title: 'Newsletter',
  description:
    'A short weekly note from EthicAI on adopting AI with people at the centre. Free, on Substack.',
  path: '/newsletter',
})

const benefits = [
  'A short read once a week: no noise, no hype.',
  'The week’s videos and articles in one place, with the thinking behind them.',
  'Practical prompts for leaders adopting AI in their organisation.',
]

export default async function NewsletterPage() {
  const [{ substackPublicationUrl }, copy] = await Promise.all([getSiteSettings(), getPageCopy()])
  const base = substackPublicationUrl?.replace(/\/+$/, '')
  const issues = await getNewsletterIssues(base)

  return (
    <>
      <PageIntro
        path="/newsletter"
        title="The EthicAI newsletter"
        photo={photoFor(copy, 'newsletter')}
        lead="A weekly note from the EthicAI team on adopting AI with people at the centre: what we’re seeing, reading and recommending."
      />
      <Container className="grid gap-12 py-20 sm:py-24 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div>
          <h2 className="text-3xl sm:text-4xl">What you’ll get</h2>
          <ul className="mt-8 space-y-4 text-lg">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex gap-3">
                <span aria-hidden="true" className="mt-3 size-2 shrink-0 rounded-full bg-accent" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
        <div className="self-start rounded-card bg-mist p-6 sm:p-8">
          <h2 className="text-2xl">Subscribe for free</h2>
          {base ? (
            <>
              <p className="mt-2 text-muted">
                You’ll sign up on Substack, which sends the newsletter. Unsubscribe any time.
              </p>
              <ButtonLink href={subscribeHref(base)} size="lg" className="mt-6 w-full">
                Subscribe on Substack
              </ButtonLink>
            </>
          ) : (
            <p className="mt-2 text-muted">Subscriptions open soon. Check back shortly.</p>
          )}
        </div>
      </Container>

      {base && (
        <section aria-labelledby="recent-issues" className="bg-mist py-20 sm:py-24">
          <Container width="reading">
            <h2 id="recent-issues" className="text-3xl">
              Recent issues
            </h2>
            {issues.length > 0 ? (
              <ol className="mt-8 divide-y divide-line">
                {issues.map((issue) => (
                  <li key={issue.link} className="py-6">
                    <h3 className="text-xl">
                      <a href={issue.link} className="hover:text-accent">
                        {issue.title}
                      </a>
                    </h3>
                    {issue.pubDate && (
                      <p className="mt-1 text-sm text-muted">
                        <time dateTime={issue.pubDate}>{formatDate(issue.pubDate)}</time>
                      </p>
                    )}
                    {issue.excerpt && <p className="mt-2 text-muted">{issue.excerpt}</p>}
                    <a
                      href={issue.link}
                      className="mt-3 inline-flex items-center gap-1.5 font-semibold text-accent hover:text-accent-strong"
                    >
                      Read on Substack<span className="sr-only">: {issue.title}</span>
                      <ArrowRightIcon className="size-4" />
                    </a>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-6 text-muted">
                Recent issues aren’t available right now. You can still read every issue on
                Substack.
              </p>
            )}
            <a
              href={`${base}/archive`}
              className="mt-8 inline-flex items-center gap-1.5 font-semibold text-accent hover:text-accent-strong"
            >
              Read the archive on Substack
              <ArrowRightIcon className="size-4" />
            </a>
          </Container>
        </section>
      )}
    </>
  )
}
