import { cn } from '@/lib/cn'

type Step = { title: string; body: string; id?: string | null }

/** How we work: a short numbered list, each step under a hairline. */
export function NumberedSteps({ steps, className }: { steps: Step[]; className?: string }) {
  if (steps.length === 0) return null
  return (
    <ol className={cn('grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {steps.map((step, index) => (
        <li key={step.id ?? step.title} className="border-t border-line-strong/50 pt-5">
          <h3 className="text-xl">
            <span className="text-muted">{index + 1}. </span>
            {step.title}
          </h3>
          <p className="mt-3 text-base text-muted">{step.body}</p>
        </li>
      ))}
    </ol>
  )
}
