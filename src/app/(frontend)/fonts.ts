import localFont from 'next/font/local'

// DECISION: self-hosted from the @fontsource-variable packages via next/font/local rather than
// next/font/google, so builds never depend on reaching Google Fonts. Latin subset only.
// next/font generates metric-matched fallbacks, so swapping fonts in causes no layout shift.

export const inter = localFont({
  src: '../../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2',
  style: 'normal',
  weight: '100 900',
  display: 'swap',
  variable: '--font-inter',
  adjustFontFallback: 'Arial',
})

// DECISION: italic is a separate, non-preloaded face (applied to em/i in globals.css). It's only
// needed for emphasis, so it shouldn't compete with the first paint on slow connections.
export const interItalic = localFont({
  src: '../../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-italic.woff2',
  style: 'italic',
  weight: '100 900',
  display: 'swap',
  preload: false,
  variable: '--font-inter-italic',
  adjustFontFallback: false,
})

// Fraunces with its optical-size axis: softer at display sizes, sturdier when small.
export const fraunces = localFont({
  src: '../../../node_modules/@fontsource-variable/fraunces/files/fraunces-latin-opsz-normal.woff2',
  style: 'normal',
  weight: '100 900',
  display: 'swap',
  variable: '--font-fraunces',
  adjustFontFallback: 'Times New Roman',
})
