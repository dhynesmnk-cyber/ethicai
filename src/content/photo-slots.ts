// The places on the site that show a photograph. Each one starts with a bundled photograph of
// Australian native trees (src/lib/photography.ts) and can be replaced in the admin under
// Page copy → Photos, so swapping a photo never needs a code change (AGENTS.md).
//
// This file must stay free of image imports: the Payload CLI (migrations, seed) loads the admin
// config, which reads these names, and it can't import .jpg files.

export const PHOTO_SLOTS = [
  { name: 'about', label: 'About page', where: 'at the top of the About page' },
  {
    name: 'services',
    label: 'Services pages',
    where: 'at the top of the Services page and each service page',
  },
  { name: 'articles', label: 'Articles page', where: 'at the top of the Articles page' },
  { name: 'watch', label: 'Watch page', where: 'at the top of the Watch page' },
  { name: 'newsletter', label: 'Newsletter page', where: 'at the top of the Newsletter page' },
  { name: 'contact', label: 'Contact page', where: 'at the top of the Contact page' },
  {
    name: 'selma',
    label: 'Meet Selma band',
    where: 'behind “Meet Selma” on the Home page and the Selma section of the About page',
  },
  {
    name: 'closing',
    label: 'Newsletter band',
    where: 'behind the newsletter sign-up at the end of the Home page',
  },
] as const

export type PhotoSlot = (typeof PHOTO_SLOTS)[number]['name'] | 'home'
