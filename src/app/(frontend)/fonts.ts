import localFont from 'next/font/local'

// The family typefaces, shared with selma.au: Plus Jakarta Sans for everything, JetBrains Mono
// for figures and small labels (docs/REDESIGN-PLAN.md §3).
// DECISION: self-hosted from the @fontsource-variable packages via next/font/local rather than
// next/font/google (selma.au loads them from Google Fonts), so builds never depend on reaching
// Google and visitors make no third-party request. Latin subset only. next/font generates
// metric-matched fallbacks, so swapping fonts in causes no layout shift.

export const jakarta = localFont({
  src: '../../../node_modules/@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2',
  style: 'normal',
  weight: '200 800',
  display: 'swap',
  variable: '--font-jakarta',
  adjustFontFallback: 'Arial',
})

// DECISION: italic is a separate, non-preloaded face (applied to em/i in globals.css). It's only
// needed for emphasis, so it shouldn't compete with the first paint on slow connections.
export const jakartaItalic = localFont({
  src: '../../../node_modules/@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-italic.woff2',
  style: 'italic',
  weight: '200 800',
  display: 'swap',
  preload: false,
  variable: '--font-jakarta-italic',
  adjustFontFallback: false,
})

// Figures and labels only (stats, step numbers), so it isn't preloaded either.
export const jetbrains = localFont({
  src: '../../../node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2',
  style: 'normal',
  weight: '100 800',
  display: 'swap',
  preload: false,
  variable: '--font-jetbrains',
  adjustFontFallback: false,
})
