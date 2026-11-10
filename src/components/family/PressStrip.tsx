import { Container } from '@/components/layout/Container'
import { formatDate } from '@/lib/format'

type Mention = {
  outlet: string
  headline: string
  url: string
  date?: string | null
  id?: string | null
}

/** Press coverage: independent sources that say who EthicAI and Selma are. */
export function PressStrip({ mentions }: { mentions: Mention[] }) {
  if (mentions.length === 0) return null
  return (
    <section aria-labelledby="in-the-press" className="border-t border-line py-16 sm:py-20">
      <Container>
        <h2 id="in-the-press" className="text-3xl sm:text-4xl">
          In the press
        </h2>
        <ul className="mt-8 grid gap-6 md:grid-cols-2">
          {mentions.map((mention) => (
            <li key={mention.id ?? mention.url}>
              <a
                href={mention.url}
                className="group block rounded-card border border-line p-6 transition-colors hover:border-accent sm:p-7"
              >
                <p className="text-sm font-semibold text-muted">
                  {mention.outlet}
                  {mention.date && (
                    <>
                      <span aria-hidden="true"> · </span>
                      <time dateTime={mention.date}>{formatDate(mention.date)}</time>
                    </>
                  )}
                </p>
                <p className="mt-3 text-xl font-bold tracking-[-0.015em] text-ink group-hover:text-accent">
                  {mention.headline}
                  <span aria-hidden="true"> ↗</span>
                </p>
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
