'use client'

import { useState } from 'react'

import { SocialIcon } from '@/components/icons/SocialIcon'
import { cn } from '@/lib/cn'

type Props = { url: string; title: string; className?: string }

const pill =
  'inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent'

/**
 * Share buttons without any share SDK (BUILD-SPEC §5.4): copy link, LinkedIn and X.
 * Client-side only for the clipboard; the two share links work without JavaScript.
 */
export function ShareLinks({ url, title, className }: Props) {
  const [status, setStatus] = useState('')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setStatus('Link copied')
    } catch {
      setStatus('Couldn’t copy the link. Copy it from the address bar instead.')
    }
  }

  const encodedUrl = encodeURIComponent(url)
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className="mr-1 text-sm font-semibold tracking-wide text-muted uppercase">Share</span>
      <button type="button" onClick={copy} className={pill}>
        Copy link
      </button>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={pill}
      >
        <SocialIcon platform="linkedin" className="size-4" />
        LinkedIn<span className="sr-only"> (opens in a new tab)</span>
      </a>
      <a
        href={`https://x.com/intent/post?url=${encodedUrl}&text=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={pill}
      >
        X<span className="sr-only"> (opens in a new tab)</span>
      </a>
      <p role="status" aria-live="polite" className="w-full text-sm text-accent">
        {status}
      </p>
    </div>
  )
}
