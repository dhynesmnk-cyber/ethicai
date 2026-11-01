import localFont from 'next/font/local'

// DECISION: self-hosted from the @fontsource-variable packages via next/font/local rather than
// next/font/google, so builds never depend on reaching Google Fonts. Latin subset only.
// next/font generates metric-matched fallbacks, so swapping fonts in causes no layout shift.

export const inter = localFont({
  src: [
    {
      path: '../../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2',
      style: 'normal',
      weight: '100 900',
    },
    {
      path: '../../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-italic.woff2',
      style: 'italic',
      weight: '100 900',
    },
  ],
  display: 'swap',
  variable: '--font-inter',
  adjustFontFallback: 'Arial',
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
