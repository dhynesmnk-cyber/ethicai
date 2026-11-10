'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type KeyboardEvent, useRef, useState } from 'react'

import { CloseIcon, MenuIcon } from '@/components/icons'
import { buttonClasses } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { currentState, type NavLink } from '@/lib/navigation'

type ExternalLink = NavLink & {
  /** Read after the label by screen readers, e.g. "opens selma.au". */
  description: string
}

type Props = { links: NavLink[]; subscribe: NavLink; external?: ExternalLink }

/**
 * Main navigation. Client-side only for two things: marking the current page (aria-current)
 * and the mobile disclosure menu (button with aria-expanded, closes on Escape and on navigation).
 * Link colours follow the header's `--header-fg`, so they read on both the transparent header
 * (over a dark hero) and the frosted one.
 */
export function SiteNav({ links, subscribe, external }: Props) {
  const pathname = usePathname()
  // The menu belongs to the page it was opened on, so navigating closes it without an effect.
  const [openOn, setOpenOn] = useState<string | null>(null)
  const open = openOn === pathname
  const toggle = useRef<HTMLButtonElement>(null)

  const close = () => setOpenOn(null)
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && open) {
      close()
      toggle.current?.focus()
    }
  }

  // The current page is marked with an underline, not colour, so it holds on any background.
  const linkClass = (href: string) =>
    cn(
      'rounded-full px-3 py-2 text-[0.9375rem] font-medium text-(--header-fg) transition-[background-color,opacity]',
      'hover:bg-[color-mix(in_srgb,var(--header-fg)_10%,transparent)]',
      currentState(pathname, href)
        ? 'underline decoration-2 underline-offset-8'
        : 'opacity-80 hover:opacity-100',
    )

  return (
    <nav aria-label="Main" onKeyDown={onKeyDown}>
      <ul className="hidden items-center gap-0.5 lg:flex">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={currentState(pathname, link.href)}
              className={linkClass(link.href)}
            >
              {link.label}
            </Link>
          </li>
        ))}
        {external && (
          <li>
            <a
              href={external.href}
              className={cn(linkClass(external.href), 'inline-flex items-center gap-1')}
            >
              {external.label}
              <span aria-hidden="true" className="text-sm">
                ↗
              </span>
              <span className="sr-only"> ({external.description})</span>
            </a>
          </li>
        )}
        <li className="ml-3">
          <Link href={subscribe.href} className={cn(buttonClasses('primary', 'md'), 'min-h-10')}>
            {subscribe.label}
          </Link>
        </li>
      </ul>

      <button
        ref={toggle}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpenOn(open ? null : pathname)}
        className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 font-semibold text-(--header-fg) hover:bg-[color-mix(in_srgb,var(--header-fg)_10%,transparent)] lg:hidden"
      >
        {open ? <CloseIcon className="size-6" /> : <MenuIcon className="size-6" />}
        Menu
      </button>

      {/* The panel is always white, so it resets the header colour to ink. */}
      <div
        id="mobile-menu"
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-line bg-canvas shadow-lg [--header-fg:var(--color-ink)] lg:hidden"
      >
        <ul className="mx-auto flex max-w-content flex-col gap-1 px-4 py-4 sm:px-6">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={currentState(pathname, link.href)}
                onClick={close}
                className={cn(linkClass(link.href), 'block py-3 text-lg')}
              >
                {link.label}
              </Link>
            </li>
          ))}
          {external && (
            <li>
              <a
                href={external.href}
                className={cn(linkClass(external.href), 'flex items-center gap-1 py-3 text-lg')}
              >
                {external.label}
                <span aria-hidden="true">↗</span>
                <span className="sr-only"> ({external.description})</span>
              </a>
            </li>
          )}
          <li className="pt-2">
            <Link
              href={subscribe.href}
              onClick={close}
              className={cn(buttonClasses('primary', 'lg'), 'w-full')}
            >
              {subscribe.label}
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}
