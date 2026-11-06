import type { ServerProps } from 'payload'
import Link from 'next/link'

import { publishingPace, runbookUrl } from '@/lib/this-week'

// The admin dashboard's "This week" panel (BUILD-SPEC §8): what needs doing, where to start, and
// the weekly checklist. A server component, so it adds no JavaScript to the admin.
// DECISION: `beforeDashboard` rather than a dashboard widget. It always sits at the top, where
// the weekly maintainer lands, and can't be dragged away or hidden by mistake.

const steps = [
  'Add the video (paste its link, set the date it went live).',
  'Write the article: excerpt, hero image with alt text, and link the video.',
  'Preview it, ideally at phone width, then publish.',
  'Check Home, Articles and Watch, then send the newsletter.',
]

async function load({ payload, user }: Pick<ServerProps, 'payload' | 'user'>) {
  // Runs as the signed-in user, so the panel only shows what they are allowed to see.
  const access = { overrideAccess: false, user } as const

  const [drafts, latest] = await Promise.all([
    // Drafts include published articles that have newer, unpublished edits.
    payload.countVersions({
      collection: 'articles',
      where: { and: [{ latest: { equals: true } }, { 'version._status': { equals: 'draft' } }] },
      ...access,
    }),
    payload.find({
      collection: 'articles',
      where: { _status: { equals: 'published' } },
      sort: '-publishedAt',
      limit: 1,
      depth: 0,
      select: { title: true, slug: true, publishedAt: true },
      ...access,
    }),
  ])
  return { drafts: drafts.totalDocs, latest: latest.docs[0] ?? null }
}

export async function ThisWeek({ payload, user }: ServerProps) {
  const adminRoute = payload.config.routes.admin
  const href = (path: string) => `${adminRoute}${path}`
  const runbook = runbookUrl(process.env.NEXT_PUBLIC_RUNBOOK_URL)

  let data: Awaited<ReturnType<typeof load>> | null = null
  try {
    data = await load({ payload, user })
  } catch (error) {
    payload.logger.error({ err: error, msg: 'Could not load the "This week" panel' })
  }

  const pace = publishingPace(data?.latest?.publishedAt)

  return (
    <section className="this-week" aria-labelledby="this-week-heading">
      <h2 id="this-week-heading" className="this-week__heading">
        This week
      </h2>

      {data ? (
        <div className="this-week__grid">
          <div className="this-week__card">
            <p className="this-week__label">Drafts waiting</p>
            <p className="this-week__figure">{data.drafts}</p>
            <Link
              className="this-week__link"
              href={href('/collections/articles?where[_status][equals]=draft')}
            >
              {data.drafts === 1 ? 'See the draft' : 'See drafts'}
            </Link>
          </div>

          <div className="this-week__card">
            <p className="this-week__label">Latest published article</p>
            {data.latest ? (
              <>
                <p className="this-week__title">{data.latest.title}</p>
                <p
                  className="this-week__note"
                  data-this-week={pace.publishedThisWeek ? 'ok' : 'due'}
                >
                  {pace.publishedThisWeek ? '✓ ' : ''}
                  {pace.summary}
                  {!pace.publishedThisWeek && ' Time for this week’s article?'}
                </p>
                <p className="this-week__links">
                  <Link
                    className="this-week__link"
                    href={href(`/collections/articles/${data.latest.id}`)}
                  >
                    Edit
                  </Link>
                  {data.latest.slug && (
                    <a className="this-week__link" href={`/articles/${data.latest.slug}`}>
                      View on the site
                    </a>
                  )}
                </p>
              </>
            ) : (
              <p className="this-week__note">{pace.summary}</p>
            )}
          </div>
        </div>
      ) : (
        <p className="this-week__note">
          We couldn’t load the weekly summary just now. The buttons below still work.
        </p>
      )}

      <p className="this-week__actions">
        <Link className="this-week__button" href={href('/collections/articles/create')}>
          New article
        </Link>
        <Link
          className="this-week__button this-week__button--secondary"
          href={href('/collections/videos/create')}
        >
          New video
        </Link>
      </p>

      <div className="this-week__card this-week__checklist">
        <h3 className="this-week__label">Weekly publishing checklist</h3>
        <ol>
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        {runbook && (
          <p>
            <a className="this-week__link" href={runbook} target="_blank" rel="noopener noreferrer">
              Open the full runbook
            </a>
          </p>
        )}
      </div>
    </section>
  )
}
