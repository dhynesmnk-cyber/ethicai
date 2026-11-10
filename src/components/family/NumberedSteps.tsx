import { cn } from '@/lib/cn'

type Step = { title: string; body: string; id?: string | null }

/** Numbered steps (01, 02 …) in mist cards, as selma.au's "How it works". */
export function NumberedSteps({ steps, className }: { steps: Step[]; className?: string }) {
  if (steps.length === 0) return null
  return (
    <ol className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {steps.map((step, index) => (
        <li key={step.id ?? step.title} className="reveal rounded-card bg-mist p-6 sm:p-7">
          <p aria-hidden="true" className="font-mono text-sm font-semibold text-accent">
            {String(index + 1).padStart(2, '0')}
          </p>
          <h3 className="mt-4 text-xl">{step.title}</h3>
          <p className="mt-2 text-base text-muted">{step.body}</p>
        </li>
      ))}
    </ol>
  )
}
