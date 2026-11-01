import type { Metadata } from 'next'
import React from 'react'

import { JsonLd } from '@/components/JsonLd'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { DEFAULT_DESCRIPTION, pageMetadata, SITE_NAME } from '@/lib/seo'
import { getSiteSettings } from '@/lib/site-settings'
import { siteUrl } from '@/lib/site-url'
import { organisationSchema } from '@/lib/structured-data'

import { fraunces, inter } from './fonts'
import './globals.css'

export const metadata: Metadata = {
  ...pageMetadata({ path: '/' }),
  // Turns relative canonical and Open Graph URLs into absolute ones.
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${SITE_NAME}: A.I. grounded in human dignity`,
    template: `%s — ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { socialLinks } = await getSiteSettings()

  return (
    <html lang="en-AU" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="flex min-h-dvh flex-col bg-canvas font-sans text-ink antialiased">
        <JsonLd data={organisationSchema((socialLinks ?? []).map((link) => link.url))} />
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
