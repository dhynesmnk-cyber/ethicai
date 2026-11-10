import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PageIntro } from '@/components/family/PageIntro'
import { ElfsightTikTok } from '@/components/feed/ElfsightTikTok'
import { VideoCard } from '@/components/feed/VideoCard'
import { ExternalIcon } from '@/components/icons'
import { Container } from '@/components/layout/Container'
import { Pagination } from '@/components/ui/Pagination'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { isElfsightWidgetId } from '@/lib/elfsight'
import { getVideos } from '@/lib/queries'
import { getSiteSettings } from '@/lib/site-settings'
import { isDisplayableVideo, videoCardProps } from '@/lib/view-models'
import { pageMetadata } from '@/lib/seo'

type Props = { searchParams: Promise<{ page?: string }> }

export const metadata: Metadata = pageMetadata({
  title: 'Watch',
  description:
    'Short videos from EthicAI on adopting AI with people at the centre, on TikTok and YouTube.',
  path: '/watch',
})

const externalLink =
  'inline-flex items-center gap-1.5 font-semibold text-accent underline-offset-4 hover:text-accent-strong hover:underline'

export default async function WatchPage({ searchParams }: Props) {
  const requested = Number((await searchParams).page)
  const page = Number.isInteger(requested) && requested > 0 ? requested : 1

  const [settings, tiktok, youtube] = await Promise.all([
    getSiteSettings(),
    getVideos({ platform: 'tiktok', limit: 6 }),
    getVideos({ platform: 'youtube', page }),
  ])
  if (page > 1 && page > youtube.totalPages) notFound()

  const handle = settings.tiktokHandle?.replace(/^@/, '')
  const tiktokVideos = tiktok.docs.filter(isDisplayableVideo)
  const youtubeVideos = youtube.docs.filter(isDisplayableVideo)
  // Checked again here (not just when saved): the ID becomes a class name on the page.
  const widgetId = isElfsightWidgetId(settings.elfsightTikTokWidgetId)
    ? settings.elfsightTikTokWidgetId
    : null

  // Hand-picked TikTok videos: shown when there's no Elfsight widget, or if it fails to load.
  const curatedTikToks =
    tiktokVideos.length > 0 ? (
      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tiktokVideos.map((video) => (
          <li key={video.id} className="flex">
            <VideoCard {...videoCardProps(video)} headingLevel="h3" />
          </li>
        ))}
      </ul>
    ) : (
      <p className="mt-6 max-w-2xl text-muted">
        Our short videos live on TikTok.
        {!handle && !widgetId && ' The feed is coming soon.'}
      </p>
    )

  return (
    <>
      <PageIntro
        path="/watch"
        title="Watch"
        eyebrow="Video"
        lead="Short videos on AI, people and change. Each one has a written summary on our Articles page."
        type="CollectionPage"
      />

      {/* TikTok first: it's where the client posts most (BUILD-SPEC §5.5). */}
      <section aria-labelledby="tiktok" className="py-20 sm:py-24">
        <Container>
          <SectionHeading id="tiktok" eyebrow="TikTok" title="Latest on TikTok" />
          {/* The Elfsight feed loads only after a click, and only on this page (AGENTS.md #4). */}
          {widgetId ? (
            <ElfsightTikTok widgetId={widgetId}>{curatedTikToks}</ElfsightTikTok>
          ) : (
            curatedTikToks
          )}
          {handle && (
            <p className="mt-8">
              <a
                href={`https://www.tiktok.com/@${encodeURIComponent(handle)}`}
                className={externalLink}
              >
                Follow @{handle} on TikTok
                <ExternalIcon className="size-4" />
              </a>
            </p>
          )}
        </Container>
      </section>

      <section aria-labelledby="youtube" className="bg-mist py-20 sm:py-24">
        <Container>
          <SectionHeading id="youtube" eyebrow="YouTube" title="Videos on YouTube" />
          {youtubeVideos.length > 0 ? (
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {youtubeVideos.map((video) => (
                <li key={video.id} className="flex">
                  <VideoCard {...videoCardProps(video)} headingLevel="h3" />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 max-w-2xl text-muted">Our YouTube videos are on their way.</p>
          )}
          <Pagination
            className="mt-12"
            page={page}
            totalPages={youtube.totalPages}
            hrefForPage={(n) => (n > 1 ? `/watch?page=${n}` : '/watch')}
          />
          {settings.youtubeChannelUrl && (
            <p className="mt-8">
              <a href={settings.youtubeChannelUrl} className={externalLink}>
                Visit our YouTube channel
                <ExternalIcon className="size-4" />
              </a>
            </p>
          )}
        </Container>
      </section>
    </>
  )
}
