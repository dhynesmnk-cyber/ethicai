// Permanent redirects from the old Squarespace site's URLs (BUILD-SPEC §9), so links and search
// results keep working when ethicai.au moves to this site. tests/fixtures/squarespace/
// sitemap-paths.txt is Squarespace's sitemap as of November 2026; a unit test checks that every
// one of those addresses either still exists here or redirects somewhere that does.
//
// `www.ethicai.au` → `ethicai.au` is handled by Netlify's domain settings (the apex is the
// primary domain), not here (docs/DEPLOYMENT-NETLIFY.md, cutover).

type Redirect = {
  source: string
  destination: string
  permanent: boolean
  has?: Array<{ type: 'query'; key: string; value?: string }>
}

export const LEGACY_REDIRECTS: Redirect[] = [
  // The blog: posts were imported with the same slugs (scripts/import-squarespace.ts).
  {
    source: '/insights',
    has: [{ type: 'query', key: 'format', value: 'rss' }],
    destination: '/articles/feed.xml',
    permanent: true,
  },
  { source: '/insights', destination: '/articles', permanent: true },
  { source: '/insights/:slug', destination: '/articles/:slug', permanent: true },

  // Contact and booking.
  { source: '/contact-us', destination: '/contact', permanent: true },
  { source: '/book-a-consultation', destination: '/contact', permanent: true },
  { source: '/booking', destination: '/contact', permanent: true },

  // Services.
  { source: '/futurefit', destination: '/services/futurefit-diagnostic', permanent: true },
  { source: '/academy', destination: '/services/academy', permanent: true },
  { source: '/aiacademy', destination: '/services/academy', permanent: true },
  // DECISION: the Academy's shop pages go to the Academy service page. Online sales are out of
  // scope for this site (BUILD-SPEC §12); point these elsewhere if the shop moves.
  { source: '/aiacademy/:path*', destination: '/services/academy', permanent: true },
  { source: '/publicsector', destination: '/services/public-sector-insights', permanent: true },
  { source: '/report', destination: '/services/public-sector-insights', permanent: true },
  // DECISION: campaign pages go to the services overview until the client says where each
  // belongs.
  { source: '/bootcamp', destination: '/services', permanent: true },
  { source: '/movement', destination: '/services', permanent: true },
  { source: '/startmate', destination: '/services', permanent: true },
  { source: '/moodi', destination: '/services', permanent: true },

  // Squarespace's shop basket.
  { source: '/cart', destination: '/', permanent: true },
]
