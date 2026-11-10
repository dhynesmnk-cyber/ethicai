import type { Metadata } from 'next'
import Image from 'next/image'

import { PageIntro } from '@/components/family/PageIntro'
import { Container } from '@/components/layout/Container'
import { creditedPhotos } from '@/lib/photography'
import { getPageCopy } from '@/lib/queries'
import { pageMetadata } from '@/lib/seo'

// Refreshed hourly, and straight away when a photo is replaced under Page copy → Photos.
export const revalidate = 3600

export const metadata: Metadata = pageMetadata({
  title: 'Photo credits',
  description:
    'Credits and licences for the photographs of Australian native trees used on the EthicAI website.',
  path: '/photo-credits',
})

/**
 * The attribution the Creative Commons licences ask for: title, author, source and licence for
 * every bundled photo still on the site. A photo replaced in the admin drops off the list.
 */
export default async function PhotoCreditsPage() {
  const photos = creditedPhotos(await getPageCopy())

  return (
    <>
      <PageIntro
        path="/photo-credits"
        title="Photo credits"
        lead="The photographs of Australian native trees on this site are shared by their photographers under Creative Commons licences. Thank you to each of them."
      />
      <Container className="py-16 sm:py-20">
        {photos.length === 0 ? (
          <p className="text-muted">Every photo on this site belongs to EthicAI.</p>
        ) : (
          <>
            <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {photos.map((photo) => (
                <li key={photo.credit.source}>
                  <div className="relative aspect-[3/2] overflow-hidden rounded-card bg-mist">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      placeholder={typeof photo.src === 'string' ? 'empty' : 'blur'}
                      className="object-cover"
                    />
                  </div>
                  <h2 className="mt-4 text-lg leading-snug">{photo.credit.title}</h2>
                  <p className="mt-1 text-base text-muted">
                    Photo by {photo.credit.author}, from{' '}
                    <a
                      href={photo.credit.source}
                      className="text-accent underline underline-offset-4 hover:text-accent-strong"
                    >
                      Wikimedia Commons
                    </a>
                    , licensed under{' '}
                    <a
                      href={photo.credit.licenceUrl}
                      rel="license"
                      className="text-accent underline underline-offset-4 hover:text-accent-strong"
                    >
                      {photo.credit.licence}
                    </a>
                    .
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-16 max-w-reading text-base text-muted">
              We resized and compressed these photos for the web, and the site crops them to fit the
              screen; nothing else was changed. Our copies of the photos licensed CC BY-SA are
              shared under the same licence.
            </p>
          </>
        )}
      </Container>
    </>
  )
}
