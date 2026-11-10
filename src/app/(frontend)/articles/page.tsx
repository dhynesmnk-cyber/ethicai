import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PageIntro } from '@/components/family/PageIntro'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import { ArticleCard } from '@/components/ui/Card'
import { Pagination } from '@/components/ui/Pagination'
import { TagChip } from '@/components/ui/TagChip'
import { toImage } from '@/lib/media'
import { photoFor } from '@/lib/photography'
import { getAllTags, getArticlesPage, getPageCopy } from '@/lib/queries'
import { readingMinutes } from '@/lib/reading-time'
import { pageMetadata } from '@/lib/seo'

type SearchParams = { page?: string; tag?: string; q?: string }
type Props = { searchParams: Promise<SearchParams> }

function parse(params: SearchParams) {
  const page = Number(params.page)
  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    tag: params.tag?.trim() || undefined,
    query: params.q?.trim().slice(0, 100) || undefined,
  }
}

function hrefFor({ page, tag, query }: { page?: number; tag?: string; query?: string }) {
  const params = new URLSearchParams()
  if (query) params.set('q', query)
  if (tag) params.set('tag', tag)
  if (page && page > 1) params.set('page', String(page))
  const search = params.toString()
  return search ? `/articles?${search}` : '/articles'
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { tag, query, page } = parse(await searchParams)
  return pageMetadata({
    title: tag ? `Articles tagged “${tag}”` : 'Articles',
    description:
      'Short reads from EthicAI on adopting AI ethically: people, culture, governance and practical change.',
    path: hrefFor({ tag, page }),
    // Search results are thin, duplicate pages; keep them out of search engines.
    noindex: Boolean(query),
  })
}

export default async function ArticlesPage({ searchParams }: Props) {
  const { page, tag, query } = parse(await searchParams)
  const [results, tags, copy] = await Promise.all([
    getArticlesPage({ page, tag, query }),
    getAllTags(),
    getPageCopy(),
  ])
  if (page > 1 && page > results.totalPages) notFound()

  const filtered = Boolean(tag || query)

  return (
    <>
      <PageIntro
        path="/articles"
        title="Articles"
        photo={photoFor(copy, 'articles')}
        lead="Short reads on adopting AI with people at the centre, written for busy leaders. Many summarise one of our videos."
        type="CollectionPage"
      />
      <div className="border-b border-line bg-mist">
        <Container className="py-8">
          <form role="search" action="/articles" method="get" className="flex max-w-xl gap-2">
            <label htmlFor="article-search" className="sr-only">
              Search articles
            </label>
            <input
              id="article-search"
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search articles"
              className="min-h-11 w-full rounded-full border border-line-strong bg-surface px-5 text-base text-ink placeholder:text-muted"
            />
            {tag && <input type="hidden" name="tag" value={tag} />}
            <Button type="submit">Search</Button>
          </form>

          {tags.length > 0 && (
            <nav aria-label="Filter by tag" className="mt-5">
              <ul className="flex flex-wrap gap-2">
                <li>
                  <TagChip label="All" href={hrefFor({ query })} current={!tag} />
                </li>
                {tags.map((t) => (
                  <li key={t}>
                    <TagChip label={t} href={hrefFor({ tag: t, query })} current={t === tag} />
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </Container>
      </div>

      <Container className="py-14 sm:py-20">
        {filtered && (
          <p className="mb-8 text-muted">
            {results.totalDocs === 1 ? '1 article' : `${results.totalDocs} articles`}
            {query && <> matching “{query}”</>}
            {tag && <> tagged “{tag}”</>}.
          </p>
        )}

        {results.docs.length > 0 ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.docs.map((article) => (
              <li key={article.id} className="flex">
                <ArticleCard
                  href={`/articles/${article.slug}`}
                  title={article.title}
                  excerpt={article.excerpt}
                  publishedAt={article.publishedAt ?? article.createdAt}
                  image={toImage(article.heroImage, 'card')}
                  tags={article.tags}
                  readingMinutes={readingMinutes(article.content)}
                  headingLevel="h2"
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-card border border-line bg-mist p-8 sm:p-10">
            <h2 className="text-2xl">
              {filtered ? 'No articles match that search' : 'No articles yet'}
            </h2>
            <p className="mt-2 text-muted">
              {filtered
                ? 'Try different words, or browse all our articles.'
                : 'Our first articles are on their way. Subscribe to the newsletter to hear when they’re out.'}
            </p>
            {filtered && (
              <Link
                href="/articles"
                className="mt-4 inline-block font-semibold text-accent underline"
              >
                Show all articles
              </Link>
            )}
          </div>
        )}

        <Pagination
          className="mt-12"
          page={page}
          totalPages={results.totalPages}
          hrefForPage={(n) => hrefFor({ page: n, tag, query })}
        />
      </Container>
    </>
  )
}
