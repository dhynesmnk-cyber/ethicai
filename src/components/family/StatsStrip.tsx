import { Container } from '@/components/layout/Container'
import { cn } from '@/lib/cn'

type Stat = { value: string; label: string; id?: string | null }

/** Proof points in a strip, figures in JetBrains Mono as on selma.au. */
export function StatsStrip({ stats, className }: { stats: Stat[]; className?: string }) {
  if (stats.length === 0) return null
  return (
    <section aria-label="EthicAI in numbers" className={cn('bg-mist py-14 sm:py-16', className)}>
      <Container>
        <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <li key={stat.id ?? stat.value} className="reveal border-t border-line-strong/40 pt-5">
              <p className="font-mono text-3xl font-semibold tracking-tight text-accent sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-2 text-base text-muted">{stat.label}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
