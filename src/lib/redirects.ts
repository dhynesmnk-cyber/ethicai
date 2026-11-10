// Permanent redirects from old Squarespace URLs that search engines already know (BUILD-SPEC §9).
// Before the domain cutover, search Google for `site:ethicai.au` and add any indexed paths here,
// e.g. { source: '/our-team', destination: '/about', permanent: true }.
export const LEGACY_REDIRECTS: Array<{ source: string; destination: string; permanent: boolean }> =
  []
