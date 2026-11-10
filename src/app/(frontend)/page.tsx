import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { FaqList } from '@/components/family/FaqList'
import { PageHero } from '@/components/family/PageHero'
import { PressStrip } from '@/components/family/PressStrip'
import { SelmaShowcase } from '@/components/family/SelmaShowcase'
import { Statement } from '@/components/family/Statement'
import { VideoCard } from '@/components/feed/VideoCard'
import { ArrowRightIcon, PlayTriangleIcon } from '@/components/icons'
import { JsonLd } from '@/components/JsonLd'
import { Container } from '@/components/layout/Container'
import { SubscribeCTA } from '@/components/newsletter/SubscribeCTA'
import { ButtonLink } from '@/components/ui/Button'
import { ArticleCard, FeatureArticleCard } from '@/components/ui/Card'
import { Quote } from '@/components/ui/Quote'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { selmaInfo } from '@/lib/family'
import { toImage } from '@/lib/media'
import { photoFor } from '@/lib/photography'
import {
  getLatestArticles,
  getPageCopy,
  getServices,
  getTeamMembers,
  getTestimonials,
  getVideos,
} from '@/lib/queries'
import { readingMinutes } from '@/lib/reading-time'
import { pageMetadata } from '@/lib/seo'
import { getSiteSettings } from '@/lib/site-settings'
import { faqSchema, webPageSchema } from '@/lib/structured-data'
import { isDisplayableVideo, teamMemberAnchor, videoCardProps } from '@/lib/view-models'
import type { Article } from '@/payload-types'

export const revalidate = 3600

export const metadata: Metadata = pageMetadata({
  path: '/',
})

const articleCardProps = (article: Article) => ({
  href: `/articles/${article.slug}`,
  title: article.title,
  excerpt: article.excerpt,
  publishedAt: article.publishedAt ?? article.createdAt,
  image: toImage(article.heroImage, 'card'),
  tags: article.tags,
  readingMinutes: readingMinutes(article.content),
})

export default async function HomePage() {
  const [copy, settings, services, articles, { docs: featuredVideos }, testimonials, team] =
    await Promise.all([
      getPageCopy(),
      getSiteSettings(),
      getServices(),
      getLatestArticles(3),
      getVideos({ featured: true, limit: 4 }),
      getTestimonials(3),
      getTeamMembers(),
    ])
  const selma = selmaInfo(settings)
  const faq = copy.faq ?? []
  const [lead, ...rest] = articles

  return (
    <>
      <JsonLd
        data={[
          webPageSchema({ path: '/', name: copy.hero?.headline ?? 'EthicAI' }),
          ...(faq.length ? [faqSchema('/', faq)] : []),
        ]}
      />

      {/* 1. The photographic opening */}
      <PageHero
        size="full"
        kicker={copy.hero?.eyebrow}
        title={copy.hero?.headline ?? 'AI grounded in human dignity'}
        lead={copy.hero?.subhead}
        photo={photoFor(copy, 'home')}
        actions={
          <>
            <ButtonLink href="/contact" size="lg">
              Work with us
            </ButtonLink>
            {selma.show ? (
              <ButtonLink href="#meet-selma" variant="underline" size="lg">
                Meet Selma
              </ButtonLink>
            ) : (
              <ButtonLink href="/articles" variant="underline" size="lg">
                Read the latest
              </ButtonLink>
            )}
          </>
        }
      />

      {/* 2. What we're for */}
      {copy.statement && <Statement text={copy.statement} />}

      {/* 3. What we do */}
      {services.length > 0 && (
        <section aria-labelledby="what-we-do" className="py-24 sm:py-28">
          <Container>
            <SectionHeading
              id="what-we-do"
              title="Ethical AI adoption, from first question to lasting change"
              action={{ href: '/services', label: 'All services' }}
            />
            <ul className="mt-12 grid gap-x-12 gap-y-2 md:grid-cols-2">
              {services.map((service) => (
                <li key={service.id} className="flex">
                  <Link
                    href={`/services/${service.slug}`}
                    className="group flex w-full flex-col border-t border-line-strong/50 py-7"
                  >
                    <span className="text-2xl font-bold tracking-[-0.02em] text-ink decoration-2 underline-offset-4 group-hover:underline">
                      {service.title}
                    </span>
                    <span className="mt-3 text-base text-muted">{service.summary}</span>
                    <span className="mt-4 inline-flex items-center gap-1.5 font-semibold text-accent">
                      Learn more
                      <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* 4. The family's product, over a photograph */}
      <SelmaShowcase selma={selma} photo={photoFor(copy, 'selma')} />

      {/* 5. Latest thinking */}
      <section aria-labelledby="latest-articles" className="py-24 sm:py-28">
        <Container>
          <SectionHeading
            id="latest-articles"
            title="Latest thinking"
            action={{ href: '/articles', label: 'View all articles' }}
          />
          {lead ? (
            <div className="mt-12 grid gap-6">
              <div className="flex">
                <FeatureArticleCard {...articleCardProps(lead)} />
              </div>
              {rest.length > 0 && (
                <ul className="grid gap-6 sm:grid-cols-2">
                  {rest.map((article) => (
                    <li key={article.id} className="flex">
                      <ArticleCard {...articleCardProps(article)} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <p className="mt-10 text-muted">Our first articles are on their way.</p>
          )}
        </Container>
      </section>

      {/* 6. Watch strip: featured videos plus a link to the TikTok feed (no third-party script here) */}
      <section aria-labelledby="watch" className="on-night py-24 sm:py-28">
        <Container>
          <SectionHeading
            id="watch"
            title="Short videos on AI and people"
            tone="dark"
            action={{ href: '/watch', label: 'See all videos' }}
          />
          {/* Scrolls sideways on small screens; focusable so keyboard users can scroll it too. */}
          <div
            role="region"
            aria-label="Featured videos"
            tabIndex={0}
            className="-mx-4 mt-12 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
          >
            <ul className="flex snap-x snap-mandatory gap-6 text-ink">
              {featuredVideos.filter(isDisplayableVideo).map((video) => (
                <li
                  key={video.id}
                  className="flex w-[85%] shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
                >
                  <VideoCard {...videoCardProps(video)} />
                </li>
              ))}
              <li className="flex w-[85%] shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]">
                <Link
                  href="/watch"
                  className="group flex min-h-72 w-full flex-col justify-between gap-6 rounded-card border border-white/15 bg-night-raised p-6 text-white transition-colors hover:border-white/40 sm:p-8"
                >
                  <span className="flex size-14 items-center justify-center rounded-full bg-accent">
                    <PlayTriangleIcon className="ml-0.5 size-6 text-white" />
                  </span>
                  <span>
                    <span className="block text-2xl font-bold tracking-[-0.02em]">
                      Our latest TikToks
                    </span>
                    <span className="mt-2 block text-night-muted">
                      Bite-sized takes on AI at work. The feed loads on the Watch page when you ask
                      for it.
                    </span>
                    <span className="mt-4 inline-flex items-center gap-1.5 font-semibold text-accent-soft">
                      Load the TikTok feed
                      <ArrowRightIcon className="size-4" />
                    </span>
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        </Container>
      </section>

      {/* Slim newsletter strip, mid-way down (BUILD-SPEC §5.1); the full band is at the end. */}
      <SubscribeCTA variant="slim" />

      {/* 7. Testimonials */}
      {testimonials.length > 0 && (
        <section aria-labelledby="testimonials" className="py-24 sm:py-28">
          <Container>
            <SectionHeading id="testimonials" title="What our clients say" align="center" />
            <ul className="mt-14 grid gap-6 lg:grid-cols-3">
              {testimonials.map((t) => (
                <li key={t.id} className="flex rounded-card bg-mist p-7 sm:p-8">
                  <Quote
                    quote={t.quote}
                    attribution={t.attribution}
                    organisation={t.organisation}
                    size="md"
                  />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* 8. Team */}
      {team.length > 0 && (
        <section aria-labelledby="team" className="pb-24 sm:pb-28">
          <Container>
            <SectionHeading
              id="team"
              title="The team"
              action={{ href: '/about', label: 'Meet the team' }}
            />
            <ul className="mt-12 grid gap-8 sm:grid-cols-3">
              {team.map((member) => {
                const photo = toImage(member.photo, 'card')
                return (
                  <li key={member.id}>
                    <Link href={`/about#${teamMemberAnchor(member.name)}`} className="group block">
                      <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-mist">
                        {photo && (
                          <Image
                            src={photo.url}
                            alt=""
                            fill
                            sizes="(min-width: 640px) 33vw, 100vw"
                            className="object-cover"
                          />
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-night/80 to-transparent p-5 pt-16">
                          <p className="text-xl font-bold tracking-[-0.02em] text-white">
                            {member.name}
                          </p>
                          <p className="text-sm text-white/80">{member.role}</p>
                        </div>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </Container>
        </section>
      )}

      {/* 9. Questions people ask (also given to search engines as FAQPage data) */}
      {faq.length > 0 && (
        <section aria-labelledby="faq" className="bg-mist py-24 sm:py-28">
          <Container className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
            <SectionHeading
              id="faq"
              title="Questions we’re often asked"
              description="About EthicAI, Selma and how we work."
              className="self-start lg:sticky lg:top-28"
            />
            <FaqList items={faq} />
          </Container>
        </section>
      )}

      {/* 10. Independent coverage */}
      <PressStrip mentions={copy.press ?? []} />

      {/* 11. Subscribe band, over a photograph */}
      <SubscribeCTA />
    </>
  )
}
