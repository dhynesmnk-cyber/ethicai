import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/family/Breadcrumbs'
import { JsonLd } from '@/components/JsonLd'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { RichText } from '@/components/blocks/RichText'
import { VideoCard } from '@/components/feed/VideoCard'
import { YouTubeFacade } from '@/components/feed/YouTubeFacade'
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/icons'
import { Container } from '@/components/layout/Container'
import { SubscribeCTA } from '@/components/newsletter/SubscribeCTA'
import { ArticleCard } from '@/components/ui/Card'
import { Prose } from '@/components/ui/Prose'
import { ShareLinks } from '@/components/ui/ShareLinks'
import { TagChip } from '@/components/ui/TagChip'
import { formatDate } from '@/lib/format'
import { toImage } from '@/lib/media'
import {
  getAdjacentArticles,
  getArticleBySlug,
  getPublishedArticleSlugs,
  getRelatedArticles,
} from '@/lib/queries'
import { readingMinutes } from '@/lib/reading-time'
import { pageMetadata } from '@/lib/seo'
import { siteUrl } from '@/lib/site-url'
import { articleSchema, breadcrumbSchema, videoSchema, webPageSchema } from '@/lib/structured-data'
import { teamMemberAnchor, videoCardProps } from '@/lib/view-models'

type Props = { params: Promise<{ slug: string }> }

// Static at build time, refreshed hourly and on publish (revalidation hooks). New slugs render
// on first request. Draft mode (admin preview) always renders fresh.
export const revalidate = 3600

export async function generateStaticParams() {
  const articles = await getPublishedArticleSlugs()
  return articles.filter((a) => a.slug).map((a) => ({ slug: a.slug as string }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { isEnabled: draft } = await draftMode()
  const article = await getArticleBySlug(slug, draft)
  if (!article) return {}

  // The share image comes from opengraph-image.tsx in this folder (it uses the SEO override
  // image when one is set).
  return pageMetadata({
    title: article.seo?.metaTitle || article.title,
    description: article.seo?.metaDescription || article.excerpt,
    path: `/articles/${article.slug}`,
    article: {
      publishedTime: article.publishedAt ?? undefined,
      modifiedTime: article.updatedAt,
      tags: article.tags ?? undefined,
    },
  })
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const { isEnabled: draft } = await draftMode()
  const article = await getArticleBySlug(slug, draft)
  if (!article) notFound()

  const [related, { older, newer }] = await Promise.all([
    getRelatedArticles(article),
    getAdjacentArticles(article),
  ])

  const hero = toImage(article.heroImage, 'hero')
  const author = typeof article.author === 'object' ? article.author : null
  // The author's team profile, when their user account is linked to one (Users → Profile).
  const profile = author && typeof author.profile === 'object' ? author.profile : null
  const profileHref = profile ? `/about#${teamMemberAnchor(profile.name)}` : null
  const authorName = profile?.name ?? author?.name
  const video = typeof article.relatedVideo === 'object' ? article.relatedVideo : null
  const publishedAt = article.publishedAt ?? article.createdAt
  const path = `/articles/${article.slug}`
  const url = `${siteUrl()}${path}`
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Articles', path: '/articles' },
    { name: article.title, path },
  ]
  const takeaways = (article.keyTakeaways ?? []).map((item) => item.point).filter(Boolean)

  const schemas = [
    webPageSchema({ path, name: article.title, description: article.excerpt }),
    articleSchema(article, hero, author ? { name: author.name, profile } : null),
    breadcrumbSchema(crumbs),
    video ? videoSchema(video, article.excerpt, toImage(video.thumbnail, 'hero')?.url) : null,
  ].filter((schema): schema is Record<string, unknown> => schema !== null)

  return (
    <>
      <JsonLd data={schemas} />
      <Container as="article" width="reading" className="py-12 sm:py-16">
        {draft && (
          <>
            <LivePreviewListener />
            <p
              className="mb-8 rounded-card border border-accent bg-accent-tint px-4 py-3 text-sm"
              role="status"
            >
              You’re previewing the latest draft.{' '}
              <a
                className="font-medium text-accent underline"
                href={`/api/exit-preview?slug=${article.slug}`}
              >
                Exit preview
              </a>
            </p>
          </>
        )}

        <Breadcrumbs items={crumbs} />

        <header className="mt-8">
          <h1 className="text-[clamp(2.25rem,5vw,3.5rem)]">{article.title}</h1>
          <p className="mt-5 text-lg text-muted sm:text-xl">{article.excerpt}</p>
          <p className="mt-6 text-sm text-muted">
            {authorName && (
              <>
                By{' '}
                {profileHref ? (
                  <Link
                    href={profileHref}
                    rel="author"
                    className="font-semibold text-ink underline-offset-4 hover:text-accent hover:underline"
                  >
                    {authorName}
                  </Link>
                ) : (
                  <span className="font-semibold text-ink">{authorName}</span>
                )}
                <span aria-hidden="true"> · </span>
              </>
            )}
            <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
            <span aria-hidden="true"> · </span>
            {readingMinutes(article.content)} min read
          </p>
          {article.tags && article.tags.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Tags">
              {article.tags.map((tag) => (
                <li key={tag}>
                  <TagChip label={tag} href={`/articles?tag=${encodeURIComponent(tag)}`} />
                </li>
              ))}
            </ul>
          )}
        </header>

        {takeaways.length > 0 && (
          <section
            aria-labelledby="in-short"
            className="mt-10 rounded-card border-l-4 border-accent bg-mist p-6 sm:p-7"
          >
            <h2 id="in-short" className="text-xl">
              In short
            </h2>
            <ul className="mt-4 space-y-3">
              {takeaways.map((point) => (
                <li key={point} className="flex gap-3 font-medium text-ink">
                  <span
                    aria-hidden="true"
                    className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent"
                  />
                  {point}
                </li>
              ))}
            </ul>
          </section>
        )}

        {hero && (
          <Image
            src={hero.url}
            alt={hero.alt}
            width={hero.width}
            height={hero.height}
            sizes="(min-width: 768px) 68ch, 100vw"
            className="mt-10 h-auto w-full rounded-card"
            // The Largest Contentful Paint element: fetch it first (`priority` is deprecated in Next 16).
            loading="eager"
            fetchPriority="high"
          />
        )}

        {video?.videoId && (
          <section aria-labelledby="original-video" className="mt-10">
            <h2 id="original-video" className="mb-4 text-2xl">
              Watch the original video
            </h2>
            {video.platform === 'youtube' ? (
              <div className="overflow-hidden rounded-card">
                <YouTubeFacade
                  videoId={video.videoId}
                  title={video.title}
                  thumbnail={toImage(video.thumbnail, 'hero')}
                  sizes="(min-width: 768px) 68ch, 100vw"
                />
              </div>
            ) : (
              <VideoCard {...videoCardProps(video)} />
            )}
          </section>
        )}

        <Prose className="mt-10">
          <RichText data={article.content} />
        </Prose>

        {profile && (
          <aside
            aria-label="About the author"
            className="mt-14 flex flex-col gap-2 rounded-card border border-line p-6 sm:p-7"
          >
            <p className="text-sm font-semibold text-muted">About the author</p>
            <p className="text-xl font-bold tracking-[-0.02em]">
              <Link href={profileHref ?? '/about'} className="hover:text-accent">
                {profile.name}
              </Link>
            </p>
            <p className="font-semibold text-accent">{profile.role}</p>
            {profile.credentials && profile.credentials.length > 0 && (
              <p className="text-sm text-muted">{profile.credentials.join(' · ')}</p>
            )}
          </aside>
        )}

        <ShareLinks url={url} title={article.title} className="mt-12 border-t border-line pt-8" />

        <SubscribeCTA variant="inline" className="mt-12" />

        {(older || newer) && (
          <nav aria-label="More articles" className="mt-12 grid gap-4 sm:grid-cols-2">
            {older ? (
              <Link
                href={`/articles/${older.slug}`}
                className="group rounded-card border border-line bg-surface p-5 transition-colors hover:border-accent"
              >
                <span className="flex items-center gap-1.5 text-sm text-muted">
                  <ArrowLeftIcon className="size-4" />
                  Older
                </span>
                <span className="mt-1 block text-lg font-bold tracking-[-0.015em] group-hover:text-accent">
                  {older.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {newer && (
              <Link
                href={`/articles/${newer.slug}`}
                className="group rounded-card border border-line bg-surface p-5 text-right transition-colors hover:border-accent"
              >
                <span className="flex items-center justify-end gap-1.5 text-sm text-muted">
                  Newer
                  <ArrowRightIcon className="size-4" />
                </span>
                <span className="mt-1 block text-lg font-bold tracking-[-0.015em] group-hover:text-accent">
                  {newer.title}
                </span>
              </Link>
            )}
          </nav>
        )}
      </Container>

      {related.length > 0 && (
        <section aria-labelledby="related" className="border-t border-line bg-mist py-20">
          <Container>
            <h2 id="related" className="text-3xl">
              Related articles
            </h2>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.id} className="flex">
                  <ArticleCard
                    href={`/articles/${item.slug}`}
                    title={item.title}
                    excerpt={item.excerpt}
                    publishedAt={item.publishedAt ?? item.createdAt}
                    image={toImage(item.heroImage, 'card')}
                    tags={item.tags}
                    readingMinutes={readingMinutes(item.content)}
                  />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}
    </>
  )
}
