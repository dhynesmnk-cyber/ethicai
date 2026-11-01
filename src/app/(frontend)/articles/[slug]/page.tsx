import config from '@payload-config'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import { LivePreviewListener } from '@/components/LivePreviewListener'
import { RichText } from '@/components/blocks/RichText'
import { Container } from '@/components/layout/Container'
import { Prose } from '@/components/ui/Prose'
import { toImage } from '@/lib/media'
import type { Article } from '@/payload-types'

// MINIMAL article page so the draft → preview → publish flow works from Phase 1.
// Phase 3 replaces the layout (meta row, related video facade, related articles, JSON-LD).

type Props = { params: Promise<{ slug: string }> }

async function findArticle(slug: string, draft: boolean): Promise<Article | undefined> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'articles',
    depth: 1,
    draft,
    limit: 1,
    pagination: false,
    where: draft
      ? { slug: { equals: slug } }
      : { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
  })
  return docs[0]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { isEnabled: draft } = await draftMode()
  const article = await findArticle(slug, draft)
  return article ? { title: article.title, description: article.excerpt } : {}
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const { isEnabled: draft } = await draftMode()
  const article = await findArticle(slug, draft)
  if (!article) notFound()

  const hero = toImage(article.heroImage, 'hero')

  return (
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
      <h1 className="text-4xl sm:text-5xl">{article.title}</h1>
      <p className="mt-4 text-lg text-muted">{article.excerpt}</p>
      {hero && (
        <Image
          src={hero.url}
          alt={hero.alt}
          width={hero.width}
          height={hero.height}
          sizes="(min-width: 768px) 68ch, 100vw"
          className="mt-8 h-auto w-full rounded-card"
          priority
        />
      )}
      <Prose className="mt-10">
        <RichText data={article.content} />
      </Prose>
    </Container>
  )
}
