import type { Metadata } from 'next'
import React from 'react'

import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'

import { fraunces, inter } from './fonts'
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
    <html lang="en-AU" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="flex min-h-dvh flex-col bg-canvas font-sans text-ink antialiased">
        <a
          href="#main"
          className="sr-only z-50 rounded-full bg-accent px-5 py-3 font-medium text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
