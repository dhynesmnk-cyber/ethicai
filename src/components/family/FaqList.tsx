import { PlusIcon } from '@/components/icons'
import { cn } from '@/lib/cn'

export type FaqItem = { question: string; answer: string; id?: string | null }

/**
 * Questions and answers as native <details> disclosures: keyboard operable with no JavaScript,
 * and every answer is in the HTML, so search engines and AI assistants can read it.
 */
export function FaqList({ items, className }: { items: FaqItem[]; className?: string }) {
  if (items.length === 0) return null
  return (
    <div className={cn('divide-y divide-line border-y border-line', className)}>
      {items.map((item) => (
        <details key={item.id ?? item.question} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-sm py-6 text-lg font-semibold text-ink transition-colors hover:text-accent [&::-webkit-details-marker]:hidden">
            <h3 className="text-[length:inherit] leading-snug font-[inherit] tracking-normal">
              {item.question}
            </h3>
            <PlusIcon className="size-6 shrink-0 text-accent transition-transform duration-300 group-open:rotate-45" />
          </summary>
          <p className="max-w-reading pb-6 text-muted">{item.answer}</p>
        </details>
      ))}
    </div>
  )
}
