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
      <div className="relative aspect-[16/9] overflow-hidden bg-sand">
        {image && (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
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
        <Heading className="text-xl sm:text-2xl">
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
