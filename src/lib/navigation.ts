export type NavLink = { href: string; label: string }

// The header menu: About · Services · Articles · Watch · Contact, then Selma ↗ (an external link
// from Site settings) and the Subscribe button.
// DECISION: Newsletter left the header menu when Services and Selma joined it (docs/REDESIGN-PLAN.md
// §1); the Subscribe button already goes to /newsletter, and the footer still lists it.
export const MAIN_NAV: NavLink[] = [
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/articles', label: 'Articles' },
  { href: '/watch', label: 'Watch' },
  { href: '/contact', label: 'Contact' },
]

/** Everything public, for the footer's Explore column. */
export const FOOTER_NAV: NavLink[] = [
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
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
