import config from '@payload-config'
import type { Metadata } from 'next'
import { headers as getHeaders } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import type { ReactNode } from 'react'

import { RichText } from '@/components/blocks/RichText'
import { VideoCard } from '@/components/feed/VideoCard'
import { YouTubeFacade } from '@/components/feed/YouTubeFacade'
import { SOCIAL_LABELS, SOCIAL_PLATFORMS, SocialIcon } from '@/components/icons/SocialIcon'
import { Container } from '@/components/layout/Container'
import { SubscribeCTA } from '@/components/newsletter/SubscribeCTA'
import { Button, ButtonLink } from '@/components/ui/Button'
import { ArticleCard } from '@/components/ui/Card'
import { Pagination } from '@/components/ui/Pagination'
import { Prose } from '@/components/ui/Prose'
import { Quote } from '@/components/ui/Quote'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { TagChip } from '@/components/ui/TagChip'
import { toImage } from '@/lib/media'

// TEMPORARY (Phase 2 review): every shared component on one page (BUILD-SPEC §10). Signed-in
// users only and hidden from search engines. Remove before launch.
export const metadata: Metadata = {
  title: 'Kitchen sink',
  robots: { index: false, follow: false },
}

const swatches = [
  ['canvas', 'bg-canvas', 'Page background'],
  ['mist', 'bg-mist', 'Light section bands'],
  ['night', 'bg-night', 'Dark sections, hero, footer'],
  ['night-raised', 'bg-night-raised', 'Cards on night'],
  ['night-muted', 'bg-night-muted', 'Secondary text on night'],
  ['ink', 'bg-ink', 'Body text'],
  ['muted', 'bg-muted', 'Secondary text'],
  ['accent', 'bg-accent', 'Family indigo: links, buttons'],
  ['accent-strong', 'bg-accent-strong', 'Hover'],
  ['accent-soft', 'bg-accent-soft', 'Accent and focus on night'],
  ['accent-tint', 'bg-accent-tint', 'Tag chips'],
  ['line', 'bg-line', 'Hairlines'],
  ['line-strong', 'bg-line-strong', 'Form borders'],
] as const

function Demo({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="border-t border-line py-12">
      <Container>
        <h2 id={id} className="mb-8 text-2xl">
          {title}
        </h2>
        {children}
      </Container>
    </section>
  )
}

type Props = { searchParams: Promise<{ page?: string }> }

export default async function KitchenSinkPage({ searchParams }: Props) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })
  if (!user) notFound()

  const page = Math.max(1, Number((await searchParams).page) || 3)
  const [{ docs: articles }, { docs: testimonials }] = await Promise.all([
    payload.find({ collection: 'articles', depth: 1, limit: 3, sort: '-publishedAt' }),
    payload.find({ collection: 'testimonials', limit: 1, sort: 'order' }),
  ])
  const testimonial = testimonials[0]

  return (
    <>
      <Container className="py-12">
        <SectionHeading
          as="h1"
          eyebrow="Design review · temporary"
          title="Kitchen sink"
          description="Every shared component in one place, for design review. Only visible when signed in to the admin."
        />
      </Container>

      <Demo id="colours" title="Colours">
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {swatches.map(([name, swatch, use]) => (
            <li key={name} className="overflow-hidden rounded-card border border-line bg-surface">
              <div className={`h-16 ${swatch}`} />
              <div className="p-3 text-sm">
                <p className="font-medium">{name}</p>
                <p className="text-muted">{use}</p>
              </div>
            </li>
          ))}
        </ul>
      </Demo>

      <Demo id="type" title="Typography">
        <div className="space-y-4">
          <p className="text-6xl font-extrabold tracking-[-0.03em]">
            A.I. grounded in human dignity
          </p>
          <p className="text-4xl font-bold tracking-[-0.025em]">
            Section heading (Plus Jakarta Sans)
          </p>
          <p className="text-2xl font-bold tracking-[-0.02em]">Card heading</p>
          <p className="font-mono text-3xl font-semibold text-accent">6M+ · 01 02 03</p>
          <p className="max-w-reading">
            Body text is Plus Jakarta Sans at 17px on phones and 18px from tablet up, with a 1.65
            line height. Figures and step numbers use JetBrains Mono, as on selma.au. In a world
            where AI is reshaping work, the most powerful thing an organisation can be is adaptable.
          </p>
          <p className="text-muted">Muted text for dates, captions and secondary details.</p>
          <p className="text-sm text-muted">Small text, e.g. “15 October 2026 · 4 min read”.</p>
        </div>
      </Demo>

      <Demo id="buttons" title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button size="lg">Large primary</Button>
          <Button disabled>Disabled</Button>
          <span className="on-night inline-flex gap-4 rounded-card p-4">
            <Button variant="light">Light (on dark)</Button>
            <Button variant="underline">Underline (on dark)</Button>
          </span>
          <ButtonLink href="/newsletter" variant="secondary">
            Link styled as a button
          </ButtonLink>
        </div>
      </Demo>

      <Demo id="section-heading" title="Section heading">
        <SectionHeading
          eyebrow="Latest"
          title="Articles"
          description="Short reads that summarise each video, written for busy leaders."
          action={{ href: '/articles', label: 'View all articles' }}
        />
      </Demo>

      <Demo id="tags" title="Tag chips">
        <div className="flex flex-wrap gap-2">
          <TagChip label="Static tag" />
          <TagChip label="Filter link" href="/kitchen-sink?tag=ai-policy" />
          <TagChip label="Active filter" href="/kitchen-sink" current />
        </div>
      </Demo>

      <Demo id="article-cards" title="Article cards">
        {articles.length === 0 ? (
          <p className="text-muted">No articles yet: run `npm run seed`.</p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <li key={article.id} className="flex">
                <ArticleCard
                  href={`/articles/${article.slug}`}
                  title={article.title}
                  excerpt={article.excerpt}
                  publishedAt={article.publishedAt ?? article.createdAt}
                  image={toImage(article.heroImage, 'card')}
                  tags={article.tags}
                  readingMinutes={4}
                />
              </li>
            ))}
          </ul>
        )}
      </Demo>

      <Demo id="video-cards" title="Video cards">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <li className="flex">
            <VideoCard
              platform="youtube"
              videoId="jNQXAC9IVRw"
              url="https://www.youtube.com/watch?v=jNQXAC9IVRw"
              title="YouTube: plays in place after a click"
              publishedAt="2026-10-15T09:00:00+11:00"
              summaryHref="/articles"
            />
          </li>
          <li className="flex">
            <VideoCard
              platform="tiktok"
              videoId="7234567890123456789"
              url="https://www.tiktok.com/@ethicai/video/7234567890123456789"
              title="TikTok: links out to the video"
              publishedAt="2026-10-08T09:00:00+11:00"
              thumbnail={toImage(articles[0]?.heroImage, 'card')}
            />
          </li>
        </ul>
      </Demo>

      <Demo id="facade" title="Click-to-load video (facade)">
        <div className="max-w-3xl overflow-hidden rounded-card">
          <YouTubeFacade
            videoId="jNQXAC9IVRw"
            title="Example YouTube video"
            sizes="(min-width: 768px) 48rem, 100vw"
          />
        </div>
        <p className="mt-3 text-sm text-muted">
          Nothing loads from YouTube until the play button is pressed.
        </p>
      </Demo>

      <Demo id="prose" title="Prose (article body)">
        {articles[0] ? (
          <Prose>
            <RichText data={articles[0].content} />
          </Prose>
        ) : (
          <p className="text-muted">No articles yet: run `npm run seed`.</p>
        )}
      </Demo>

      <Demo id="quote" title="Quote">
        <Quote
          quote={
            testimonial?.quote ??
            'EthicAI made AI understandable and actionable for our whole team.'
          }
          attribution={testimonial?.attribution ?? 'Managing Director'}
          organisation={testimonial?.organisation}
          className="max-w-3xl"
        />
      </Demo>

      <Demo id="pagination" title="Pagination">
        <Pagination page={page} totalPages={9} hrefForPage={(n) => `/kitchen-sink?page=${n}`} />
      </Demo>

      <Demo id="subscribe-inline" title="Subscribe call to action (inline)">
        <SubscribeCTA variant="inline" className="max-w-reading" />
      </Demo>

      <Demo id="social" title="Social icons">
        <ul className="flex flex-wrap gap-4">
          {SOCIAL_PLATFORMS.map((platform) => (
            <li key={platform} className="flex items-center gap-2">
              <SocialIcon platform={platform} className="size-6" />
              {SOCIAL_LABELS[platform]}
            </li>
          ))}
        </ul>
      </Demo>

      <Demo id="motion" title="Motion">
        <p className="mb-6 max-w-reading text-muted">
          Blocks fade up as they scroll into view. Turned off for anyone who prefers reduced motion,
          and absent in browsers without scroll-driven animations.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {['First', 'Second', 'Third'].map((label) => (
            <div key={label} className="reveal rounded-card border border-line bg-surface p-8">
              {label}
            </div>
          ))}
        </div>
      </Demo>

      <SubscribeCTA />
    </>
  )
}
