import { Container } from '@/components/layout/Container'

type Props = { eyebrow?: string; text: string; id?: string }

/** A large, centred statement, like selma.au's "Meet Selma" section. */
export function Statement({ eyebrow, text, id = 'statement' }: Props) {
  return (
    <section aria-labelledby={id} className="py-24 sm:py-32">
      <Container className="max-w-4xl text-center">
        <h2 id={id} className="eyebrow mb-7 text-accent">
          {eyebrow ?? 'Why we exist'}
        </h2>
        <p className="reveal text-[clamp(1.375rem,3vw,2.25rem)] leading-[1.4] font-semibold tracking-[-0.02em] text-ink">
          {text}
        </p>
      </Container>
    </section>
  )
}
