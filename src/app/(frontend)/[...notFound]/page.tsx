import { notFound } from 'next/navigation'

// DECISION: a catch-all that defers to not-found.tsx, so unknown URLs get the branded 404 inside
// the site's header and footer. With two root layouts (site and admin) Next.js can't compose a
// global 404 itself, and global-not-found.js is still experimental. More specific routes,
// including Payload's /admin and /api, always match first.
export default function CatchAll() {
  notFound()
}
