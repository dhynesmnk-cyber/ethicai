import config from '@payload-config'
import type { DefaultNodeTypes, SerializedBlockNode } from '@payloadcms/richtext-lexical'
import { type JSXConvertersFunction, RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import { LivePreviewListener } from '@/components/LivePreviewListener'
import type { Article, YouTubeBlock } from '@/payload-types'

// MINIMAL article page so the draft → preview → publish flow works from Phase 1.
// Phase 3 replaces the layout (meta row, related video facade, related articles, JSON-LD).

type Props = { params: Promise<{ slug: string }> }

const converters: JSXConvertersFunction<DefaultNodeTypes | SerializedBlockNode<YouTubeBlock>> = ({
  defaultConverters,
}) => ({
  ...defaultConverters,
  blocks: {
    // Phase 3: swap for the click-to-load YouTube facade.
    youtube: ({ node }) => (
      <p>
        <a href={node.fields.url}>{node.fields.title || 'Watch the video on YouTube'}</a>
      </p>
    ),
  },
})

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

  const hero = typeof article.heroImage === 'object' ? article.heroImage : null

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      {draft && (
        <>
          <LivePreviewListener />
          <p className="mb-8 rounded border px-4 py-2 text-sm" role="status">
            You’re previewing the latest draft.{' '}
            <a className="underline" href={`/api/exit-preview?slug=${article.slug}`}>
              Exit preview
            </a>
          </p>
        </>
      )}
      <h1 className="text-4xl font-semibold tracking-tight">{article.title}</h1>
      <p className="mt-4 text-lg">{article.excerpt}</p>
      {hero?.url && hero.width && hero.height && (
        <Image
          src={hero.url}
          alt={hero.alt}
          width={hero.width}
          height={hero.height}
          sizes="(min-width: 768px) 768px, 100vw"
          className="mt-8 h-auto w-full rounded-lg"
          priority
        />
      )}
      <RichText className="mt-8 space-y-4" converters={converters} data={article.content} />
    </article>
  )
}
