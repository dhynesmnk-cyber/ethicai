import type { Metadata } from 'next'
import React from 'react'

import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'EthicAI',
    template: '%s — EthicAI',
  },
  description:
    'EthicAI helps organisations adopt AI ethically, blending sharp operational insight with deep people strategy.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU">
      <body className="antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:outline-2"
        >
          Skip to content
        </a>
        <main id="main">{children}</main>
      </body>
    </html>
  )
}
