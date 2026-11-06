import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { HeroGraphic } from '@/components/HeroGraphic'
import { VideoCard } from '@/components/feed/VideoCard'
import { ArrowRightIcon, PlayIcon } from '@/components/icons'
import { Container } from '@/components/layout/Container'
import { SubscribeCTA } from '@/components/newsletter/SubscribeCTA'
import { ButtonLink } from '@/components/ui/Button'
import { ArticleCard } from '@/components/ui/Card'
import { Quote } from '@/components/ui/Quote'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { HERO, INTRO, VALUE_PROPS } from '@/content/site-copy'
import { toImage } from '@/lib/media'
import { getLatestArticles, getTeamMembers, getTestimonials, getVideos } from '@/lib/queries'
import { readingMinutes } from '@/lib/reading-time'
import { isDisplayableVideo, teamMemberAnchor, videoCardProps } from '@/lib/view-models'
import { pageMetadata } from '@/lib/seo'

export const revalidate = 3600

export const metadata: Metadata = pageMetadata({
  path: '/',
})

export default async function HomePage() {
  const [articles, { docs: featuredVideos }, testimonials, team] = await Promise.all([
    getLatestArticles(3),
    getVideos({ featured: true, limit: 4 }),
    getTestimonials(3),
    getTeamMembers(),
  ])

  return (
    <>
      {/* 1. Hero */}
      <Container className="grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl">{HERO.headline}</h1>
          <p className="mt-6 max-w-2xl text-lg text-muted sm:text-xl">{HERO.subhead}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/articles" size="lg">
              Read the latest
            </ButtonLink>
            <ButtonLink href="/newsletter" variant="secondary" size="lg">
              Subscribe to the newsletter
            </ButtonLink>
          </div>
        </div>
        <HeroGraphic className="mx-auto hidden w-full max-w-sm text-accent lg:block" />
      </Container>

      {/* 2. Value proposition */}
      <section aria-labelledby="what-we-do" className="bg-sand py-16 sm:py-20">
        <Container>
          <SectionHeading id="what-we-do" eyebrow="What we do" title="Adaptable by design" />
          <p className="mt-6 max-w-3xl text-lg">{INTRO}</p>
          <ul className="mt-12 grid gap-8 md:grid-cols-3">
            {VALUE_PROPS.map((item) => (
              <li key={item.title} className="reveal border-t-2 border-accent pt-6">
                <h3 className="text-2xl">{item.title}</h3>
                <p className="mt-3 text-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* 3. Latest articles */}
      <section aria-labelledby="latest-articles" className="py-16 sm:py-20">
        <Container>
          <SectionHeading
            id="latest-articles"
            eyebrow="Read"
            title="Latest articles"
            action={{ href: '/articles', label: 'View all articles' }}
          />
          {articles.length > 0 ? (
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <li key={article.id} className="reveal flex">
                  <ArticleCard
                    href={`/articles/${article.slug}`}
                    title={article.title}
                    excerpt={article.excerpt}
                    publishedAt={article.publishedAt ?? article.createdAt}
                    image={toImage(article.heroImage, 'card')}
                    tags={article.tags}
                    readingMinutes={readingMinutes(article.content)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-10 text-muted">Our first articles are on their way.</p>
          )}
        </Container>
      </section>

      {/* 4. Watch strip: featured videos plus a link to the TikTok feed (no third-party script here) */}
      <section aria-labelledby="watch" className="border-y border-line bg-surface py-16 sm:py-20">
        <Container>
          <SectionHeading
            id="watch"
            eyebrow="Watch"
            title="Short videos on AI and people"
            action={{ href: '/watch', label: 'See all videos' }}
          />
          {/* Scrolls sideways on small screens; focusable so keyboard users can scroll it too. */}
          <div
            role="region"
            aria-label="Featured videos"
            tabIndex={0}
            className="-mx-4 mt-10 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
          >
            <ul className="flex snap-x snap-mandatory gap-6">
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
                  className="group flex min-h-72 w-full flex-col justify-between gap-6 rounded-card bg-ink p-6 text-white sm:p-8"
                >
                  <PlayIcon className="size-12 text-accent transition-transform group-hover:scale-110" />
                  <span>
                    <span className="block font-serif text-2xl">Our latest TikToks</span>
                    <span className="mt-2 block text-white/80">
                      Bite-sized takes on AI at work. The feed loads on the Watch page when you ask
                      for it.
                    </span>
                    <span className="mt-4 inline-flex items-center gap-1.5 font-medium">
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

      {/* 5. Testimonials */}
      {testimonials.length > 0 && (
        <section aria-labelledby="testimonials" className="py-16 sm:py-20">
          <Container>
            <SectionHeading id="testimonials" eyebrow="Clients" title="What our clients say" />
            <ul className="mt-10 grid gap-10 lg:grid-cols-3">
              {testimonials.map((t) => (
                <li key={t.id} className="reveal flex border-l-2 border-accent pl-6">
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

      {/* 6. Team teaser */}
      {team.length > 0 && (
        <section aria-labelledby="team" className="pb-16 sm:pb-20">
          <Container>
            <SectionHeading
              id="team"
              eyebrow="People"
              title="The team"
              action={{ href: '/about', label: 'Meet the team' }}
            />
            <ul className="mt-10 grid gap-8 sm:grid-cols-3">
              {team.map((member) => {
                const photo = toImage(member.photo, 'thumbnail')
                return (
                  <li key={member.id}>
                    <Link href={`/about#${teamMemberAnchor(member.name)}`} className="group block">
                      <div className="relative aspect-square overflow-hidden rounded-card bg-sand">
                        {photo && (
                          <Image
                            src={photo.url}
                            alt=""
                            fill
                            sizes="(min-width: 640px) 33vw, 100vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                          />
                        )}
                      </div>
                      <p className="mt-4 font-serif text-xl group-hover:text-accent">
                        {member.name}
                      </p>
                      <p className="text-muted">{member.role}</p>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </Container>
        </section>
      )}

      {/* 7. Subscribe band */}
      <SubscribeCTA />
    </>
  )
}
