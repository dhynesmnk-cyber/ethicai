import type { Metadata } from 'next'
import React from 'react'

import { FamilyBar } from '@/components/family/FamilyBar'
import { JsonLd } from '@/components/JsonLd'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { DEFAULT_DESCRIPTION, HOME_TITLE, pageMetadata, SITE_NAME } from '@/lib/seo'
import { getSiteSettings } from '@/lib/site-settings'
import { isReviewSite, siteUrl } from '@/lib/site-url'
import { getTeamMembers } from '@/lib/queries'
import { siteSchemas } from '@/lib/structured-data'

import { jakarta, jakartaItalic } from './fonts'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const { search } = await getSiteSettings()
  return {
    ...pageMetadata({ path: '/' }),
    // Turns relative canonical and Open Graph URLs into absolute ones.
    metadataBase: new URL(siteUrl()),
    title: {
      default: HOME_TITLE,
      template: `%s — ${SITE_NAME}`,
    },
    description: DEFAULT_DESCRIPTION,
    // Search Console / Bing Webmaster Tools ownership tags, when an admin has entered them.
    verification: {
      ...(search?.googleVerification ? { google: search.googleVerification } : {}),
      ...(search?.bingVerification ? { other: { 'msvalidate.01': search.bingVerification } } : {}),
    },
    // Review sites (netlify.app) must not be indexed; this also covers crawlers that ignore robots.txt.
    ...(isReviewSite() && { robots: { index: false, follow: false } }),
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, team] = await Promise.all([getSiteSettings(), getTeamMembers()])
  // Founders are linked from the Organization record (the About page has their full records).
  const founders = team.filter((member) => /founder/i.test(member.role))

  return (
    <html lang="en-AU" className={`${jakarta.variable} ${jakartaItalic.variable}`}>
      <body className="flex min-h-dvh flex-col bg-canvas font-sans text-ink antialiased">
        <JsonLd data={siteSchemas({ settings, founders })} />
        <a
          href="#main"
          className="sr-only z-[60] rounded-full bg-accent px-5 py-3 font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <FamilyBar />
        <Header />
        <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
