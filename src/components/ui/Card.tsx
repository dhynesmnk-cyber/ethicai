import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { TagChip } from '@/components/ui/TagChip'
import { cn } from '@/lib/cn'
import { formatDate } from '@/lib/format'
import type { ImageData } from '@/lib/media'

/** Surface shared by article and video cards. */
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-card border border-line bg-surface',
        'transition-[transform,box-shadow] duration-300 ease-out-soft hover:-translate-y-1 hover:shadow-[0_18px_40px_-24px_rgb(29_29_31/0.35)] motion-reduce:hover:translate-y-0',
        // The whole card is one click target; show focus around the card, not just the title.
        'has-[a[data-card-link]:focus-visible]:outline-[3px] has-[a[data-card-link]:focus-visible]:outline-offset-[3px] has-[a[data-card-link]:focus-visible]:outline-accent has-[a[data-card-link]:focus-visible]:outline-solid',
        className,
      )}
    >
      {children}
    </article>
  )
}

type ArticleCardProps = {
  href: string
  title: string
  excerpt: string
  publishedAt: string
  image?: ImageData | null
  tags?: string[] | null
  readingMinutes?: number
  headingLevel?: 'h2' | 'h3'
}

export function ArticleCard({
  href,
  title,
  excerpt,
  publishedAt,
  image,
  tags,
  readingMinutes,
  headingLevel: Heading = 'h3',
}: ArticleCardProps) {
  return (
    <Card>
      <div className="relative aspect-[16/9] overflow-hidden bg-mist">
        {image && (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.03]"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        {tags && tags.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Tags">
            {tags.map((tag) => (
              <li key={tag}>
                <TagChip label={tag} />
              </li>
            ))}
          </ul>
        )}
        <Heading className="text-xl sm:text-[1.375rem]">
          <Link
            href={href}
            data-card-link
            className="text-ink after:absolute after:inset-0 hover:text-accent focus-visible:outline-none"
          >
            {title}
          </Link>
        </Heading>
        <p className="line-clamp-3 text-base text-muted">{excerpt}</p>
        <p className="mt-auto pt-2 text-sm text-muted">
          <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
          {readingMinutes !== undefined && (
            <>
              <span aria-hidden="true"> · </span>
              {readingMinutes} min read
            </>
          )}
        </p>
      </div>
    </Card>
  )
}

/** The lead story: a large card with the image beside the text from tablet up. */
export function FeatureArticleCard({
  href,
  title,
  excerpt,
  publishedAt,
  image,
  tags,
  readingMinutes,
}: Omit<ArticleCardProps, 'headingLevel'>) {
  return (
    <Card className="md:grid md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <div className="relative aspect-[16/9] overflow-hidden bg-mist md:aspect-auto md:min-h-80">
        {image && (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes="(min-width: 768px) 60vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.03]"
          />
        )}
      </div>
      <div className="flex flex-col gap-4 p-6 sm:p-8 lg:p-10">
        <p className="eyebrow text-accent">Latest</p>
        {tags && tags.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Tags">
            {tags.map((tag) => (
              <li key={tag}>
                <TagChip label={tag} />
              </li>
            ))}
          </ul>
        )}
        <h3 className="text-2xl sm:text-3xl">
          <Link
            href={href}
            data-card-link
            className="text-ink after:absolute after:inset-0 hover:text-accent focus-visible:outline-none"
          >
            {title}
          </Link>
        </h3>
        <p className="line-clamp-4 text-muted">{excerpt}</p>
        <p className="mt-auto pt-2 text-sm text-muted">
          <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
          {readingMinutes !== undefined && (
            <>
              <span aria-hidden="true"> · </span>
              {readingMinutes} min read
            </>
          )}
        </p>
      </div>
    </Card>
  )
}
