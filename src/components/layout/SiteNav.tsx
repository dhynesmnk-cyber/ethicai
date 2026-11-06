'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type KeyboardEvent, useRef, useState } from 'react'

import { CloseIcon, MenuIcon } from '@/components/icons'
import { buttonClasses } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { currentState, type NavLink } from '@/lib/navigation'

type Props = { links: NavLink[]; subscribe: NavLink }

/**
 * Main navigation. Client-side only for two things: marking the current page (aria-current)
 * and the mobile disclosure menu (button with aria-expanded, closes on Escape and on navigation).
 */
export function SiteNav({ links, subscribe }: Props) {
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

  const linkClass = (href: string) =>
    cn(
      'rounded-full px-3 py-2 font-medium transition-colors hover:bg-accent-tint hover:text-accent',
      currentState(pathname, href) ? 'text-accent' : 'text-ink',
    )

  return (
    <nav aria-label="Main" onKeyDown={onKeyDown}>
      <ul className="hidden items-center gap-1 md:flex">
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
        <li className="ml-3">
          <Link href={subscribe.href} className={buttonClasses('primary', 'md')}>
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
        className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 font-medium text-ink hover:bg-accent-tint md:hidden"
      >
        {open ? <CloseIcon className="size-6" /> : <MenuIcon className="size-6" />}
        Menu
      </button>

      <div
        id="mobile-menu"
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-line bg-canvas shadow-lg md:hidden"
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
