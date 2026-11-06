import { getPayload } from 'payload'

import config from '../../src/payload.config'
import type { Article, Video } from '../../src/payload-types'

// Temporary content for e2e tests, created and removed through the Local API. Revalidation is
// skipped because these calls run outside Next.js. A fresh context object per call matters: the
// storage plugin leaves a flag on a shared one.

const context = () => ({ disableRevalidate: true })

export const lexicalParagraph = (text: string): Article['content'] => ({
  root: {
    type: 'root',
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    children: [
      {
        type: 'paragraph',
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        textFormat: 0,
        children: [
          { type: 'text', text, format: 0, style: '', mode: 'normal', detail: 0, version: 1 },
        ],
      },
    ],
  },
})

/** Any image already in the media library (from `npm run seed`), or undefined. */
export async function anyMediaId(): Promise<number | undefined> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'media', depth: 0, limit: 1 })
  return docs[0]?.id
}

export async function anyUserId(): Promise<number | undefined> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'users', depth: 0, limit: 1 })
  return docs[0]?.id
}

export async function createArticle(
  data: Partial<Article> & Pick<Article, 'title' | 'slug' | 'heroImage' | 'author'>,
): Promise<Article> {
  const payload = await getPayload({ config })
  return payload.create({
    collection: 'articles',
    context: context(),
    data: {
      excerpt: `Excerpt for ${data.title}.`,
      content: lexicalParagraph(`Body text for ${data.title}.`),
      _status: 'published',
      ...data,
    },
  })
}

export async function createVideo(
  data: Partial<Video> & Pick<Video, 'url' | 'title' | 'publishedAt'>,
): Promise<Video> {
  const payload = await getPayload({ config })
  return payload.create({ collection: 'videos', context: context(), data })
}

/** Cleanup must not fail because a test already removed the record (e.g. through the API). */
async function ignoreMissing(run: () => Promise<unknown>): Promise<void> {
  try {
    await run()
  } catch (error) {
    if (!(error instanceof Error && error.name === 'NotFound')) throw error
  }
}

export async function deleteArticles(ids: number[]): Promise<void> {
  const payload = await getPayload({ config })
  for (const id of ids) {
    await ignoreMissing(() => payload.delete({ collection: 'articles', id, context: context() }))
  }
}

export async function deleteVideos(ids: number[]): Promise<void> {
  const payload = await getPayload({ config })
  for (const id of ids) {
    await ignoreMissing(() => payload.delete({ collection: 'videos', id, context: context() }))
  }
}
