import { Container } from '@/components/layout/Container'

type Props = { heading?: string; text: string; id?: string }

/** What EthicAI is for, in large type: a short heading beside the paragraph. */
export function Statement({ heading, text, id = 'statement' }: Props) {
  return (
    <section aria-labelledby={id} className="py-24 sm:py-32">
      <Container className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)] lg:gap-16">
        <h2 id={id} className="text-xl text-muted lg:pt-2">
          {heading ?? 'Why we exist'}
        </h2>
        <p className="text-[clamp(1.375rem,2.6vw,2.125rem)] leading-[1.4] font-semibold tracking-[-0.02em] text-ink">
          {text}
        </p>
      </Container>
    </section>
  )
}
