import config from '@payload-config'
import type { Metadata } from 'next'
import { headers as getHeaders } from 'next/headers'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

// TEMPORARY (Phase 0 acceptance): shows the latest uploads served from object storage, to prove
// that admin uploads land in the bucket and render through next/image. Signed-in users only.
// Remove before launch.
export const metadata: Metadata = {
  title: 'Media check',
  robots: { index: false, follow: false },
}

export default async function MediaCheckPage() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })
  if (!user) notFound()

  const { docs } = await payload.find({
    collection: 'media',
    depth: 0,
    limit: 6,
    sort: '-createdAt',
  })

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-2xl font-semibold">Media check</h1>
      <p className="mt-2">The latest uploads, served from object storage.</p>
      {docs.length === 0 ? (
        <p className="mt-8">No uploads yet. Add an image in the admin, then reload this page.</p>
      ) : (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((doc) =>
            doc.url && doc.width && doc.height ? (
              <li key={doc.id}>
                <figure>
                  <Image
                    src={doc.url}
                    alt={doc.alt}
                    width={doc.width}
                    height={doc.height}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="h-auto w-full rounded-lg"
                  />
                  <figcaption className="mt-2 text-sm break-all">{doc.filename}</figcaption>
                </figure>
              </li>
            ) : null,
          )}
        </ul>
      )}
    </div>
  )
}
