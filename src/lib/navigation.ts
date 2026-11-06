export type NavLink = { href: string; label: string }

// BUILD-SPEC §5.1: About · Articles · Watch · Newsletter · Contact, plus a Subscribe button.
export const MAIN_NAV: NavLink[] = [
  { href: '/about', label: 'About' },
  { href: '/articles', label: 'Articles' },
  { href: '/watch', label: 'Watch' },
  { href: '/newsletter', label: 'Newsletter' },
  { href: '/contact', label: 'Contact' },
]

// DECISION: the header's Subscribe button goes to /newsletter (spec default) so visitors see
// what they're signing up for before leaving the site for Substack.
export const SUBSCRIBE_LINK: NavLink = { href: '/newsletter', label: 'Subscribe' }

/** aria-current value for a nav link: "page" on the page itself, "true" anywhere beneath it. */
export function currentState(pathname: string, href: string): 'page' | 'true' | undefined {
  if (pathname === href) return 'page'
  if (pathname.startsWith(`${href}/`)) return 'true'
  return undefined
}
