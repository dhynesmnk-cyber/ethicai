import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { VideoCard } from '@/components/feed/VideoCard'
import { ExternalIcon } from '@/components/icons'
import { Container } from '@/components/layout/Container'
import { Pagination } from '@/components/ui/Pagination'
import { SectionHeading } from '@/components/ui/SectionHeading'
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
  'inline-flex items-center gap-1.5 font-medium text-accent underline-offset-4 hover:text-accent-strong hover:underline'

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

  return (
    <>
      <Container className="py-16 sm:py-20">
        <SectionHeading
          as="h1"
          title="Watch"
          description="Short videos on AI, people and change. Each one has a written summary on our Articles page."
        />
      </Container>

      {/* TikTok first: it's where the client posts most (BUILD-SPEC §5.5). */}
      <section aria-labelledby="tiktok" className="border-t border-line py-16">
        <Container>
          <SectionHeading id="tiktok" eyebrow="TikTok" title="Latest on TikTok" />
          {/* Phase 4 adds the Elfsight feed here, loaded only after a click. */}
          {tiktokVideos.length > 0 ? (
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
              {!handle && ' The feed is coming soon.'}
            </p>
          )}
          {handle && (
            <p className="mt-8">
              <a href={`https://www.tiktok.com/@${handle}`} className={externalLink}>
                Follow @{handle} on TikTok
                <ExternalIcon className="size-4" />
              </a>
            </p>
          )}
        </Container>
      </section>

      <section aria-labelledby="youtube" className="border-t border-line bg-surface py-16">
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
