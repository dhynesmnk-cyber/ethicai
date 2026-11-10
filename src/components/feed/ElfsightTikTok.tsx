'use client'

import Link from 'next/link'
import { type ReactNode, useEffect, useRef, useState } from 'react'

import { SocialIcon } from '@/components/icons/SocialIcon'
import { Button } from '@/components/ui/Button'
import { elfsightAppClass, loadElfsightPlatform } from '@/lib/elfsight'

type Props = {
  /** A widget ID already checked with isElfsightWidgetId (from siteSettings). */
  widgetId: string
  /** Shown instead if the feed fails to load: the hand-picked TikTok videos. */
  children: ReactNode
}

type Status = 'idle' | 'loading' | 'ready' | 'failed'

// Long enough for a slow mobile connection to fetch the script and the feed; after that we
// assume it isn't coming (blocked, offline, or the monthly view limit is used up).
const LOAD_TIMEOUT_MS = 15_000

const announcements: Record<Status, string> = {
  idle: '',
  loading: 'Loading the TikTok feed…',
  ready: 'TikTok feed loaded.',
  failed: '',
}

/**
 * Click-to-load facade for the Elfsight TikTok feed (BUILD-SPEC §7.1). Nothing from Elfsight
 * loads until the visitor presses the button: each load uses one of the plan's monthly views
 * (see src/lib/elfsight.ts), and the script is third-party code with its own privacy terms.
 */
export function ElfsightTikTok({ widgetId, children }: Props) {
  const [status, setStatus] = useState<Status>('idle')
  const feed = useRef<HTMLDivElement>(null)
  const widget = useRef<HTMLDivElement>(null)
  const notice = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (status !== 'loading' || !widget.current) return
    // The button the visitor pressed has gone; keep their place on the feed instead.
    feed.current?.focus()

    let settled = false
    const settle = (next: Status) => {
      if (settled) return
      settled = true
      setStatus(next)
    }
    // Elfsight renders the feed inside our container, so content appearing there means success.
    const target = widget.current
    const rendered = () => target.childElementCount > 0 || target.shadowRoot !== null
    const observer = new MutationObserver(() => {
      if (rendered()) settle('ready')
    })
    observer.observe(target, { childList: true })
    // Never swap out a feed that did render, even if we missed the moment it arrived.
    const timer = window.setTimeout(() => settle(rendered() ? 'ready' : 'failed'), LOAD_TIMEOUT_MS)
    loadElfsightPlatform().catch(() => settle('failed'))

    return () => {
      observer.disconnect()
      window.clearTimeout(timer)
    }
  }, [status])

  useEffect(() => {
    if (status === 'failed') notice.current?.focus()
  }, [status])

  return (
    <div className="mt-10">
      <p role="status" className="sr-only">
        {announcements[status]}
      </p>

      {/* DECISION: a light card rather than TikTok black, so the accent focus ring and primary
          button keep their contrast (the accent is under 3:1 against ink). */}
      {status === 'idle' && (
        <div className="flex max-w-3xl flex-col items-start gap-5 rounded-card border border-line bg-mist p-6 sm:flex-row sm:items-center sm:p-8">
          <SocialIcon platform="tiktok" className="size-10 shrink-0 text-ink" />
          <div className="flex-1">
            <p className="text-2xl font-bold tracking-[-0.02em]">Our latest TikToks, right here</p>
            <p className="mt-2 text-muted">
              The feed comes from Elfsight, a third-party service, so it only loads when you ask for
              it. See our{' '}
              <Link
                href="/privacy-policy"
                className="font-medium text-accent underline underline-offset-4 hover:text-accent-strong"
              >
                privacy policy
              </Link>
              .
            </p>
          </div>
          <Button size="lg" onClick={() => setStatus('loading')} className="shrink-0">
            Show latest TikToks
          </Button>
        </div>
      )}

      {(status === 'loading' || status === 'ready') && (
        <div
          ref={feed}
          role="region"
          aria-label="TikTok feed"
          aria-busy={status === 'loading'}
          tabIndex={-1}
          className="min-h-96 rounded-card"
        >
          {status === 'loading' && (
            <p aria-hidden="true" className="text-muted">
              Loading the TikTok feed…
            </p>
          )}
          {/* Elfsight's script finds this element by its class and fills it. */}
          <div ref={widget} className={elfsightAppClass(widgetId)} />
        </div>
      )}

      {status === 'failed' && (
        <>
          <p ref={notice} tabIndex={-1} className="max-w-2xl text-muted">
            The TikTok feed couldn’t load just now.
          </p>
          {children}
        </>
      )}
    </div>
  )
}
