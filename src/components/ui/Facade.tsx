'use client'

import { type ReactNode, useEffect, useRef, useState } from 'react'

import { PlayIcon } from '@/components/icons'

type Props = {
  /** Accessible name for the play button, e.g. "Play video: Why ethical AI starts with people". */
  label: string
  /** Loaded only after the visitor presses play. */
  embedSrc: string
  /** Accessible name for the player once it loads. */
  iframeTitle: string
  /** The poster image shown until then. */
  children: ReactNode
}

/**
 * Click-to-load embed (BUILD-SPEC §7.3): shows a poster and a play button, and only swaps in
 * the third-party iframe when the visitor asks for it. No third-party code loads before that.
 */
export function Facade({ label, embedSrc, iframeTitle, children }: Props) {
  const [active, setActive] = useState(false)
  const frame = useRef<HTMLIFrameElement>(null)

  // Keyboard users land on the player they just started.
  useEffect(() => {
    if (active) frame.current?.focus()
  }, [active])

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-ink">
      {active ? (
        <iframe
          ref={frame}
          src={embedSrc}
          title={iframeTitle}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 size-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          aria-label={label}
          className="group absolute inset-0 size-full cursor-pointer"
        >
          {children}
          <PlayIcon className="absolute top-1/2 left-1/2 size-16 -translate-x-1/2 -translate-y-1/2 text-accent drop-shadow-lg transition-transform group-hover:scale-110 group-focus-visible:scale-110" />
        </button>
      )}
    </div>
  )
}
