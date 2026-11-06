import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Articles } from './collections/Articles'
import { Media, MAX_UPLOAD_BYTES } from './collections/Media'
import { TeamMembers } from './collections/TeamMembers'
import { Testimonials } from './collections/Testimonials'
import { Users } from './collections/Users'
import { Videos } from './collections/Videos'
import { SiteSettings } from './globals/SiteSettings'
import { publicFileURL, readS3Settings } from './lib/storage'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const s3 = readS3Settings()

export default buildConfig({
  admin: {
    user: Users.slug,
    // Australian date order throughout the admin, e.g. "22 October 2026, 9:30 am".
    dateFormat: 'd MMMM yyyy, h:mm a',
    components: {
      // The weekly maintainer's landing panel (BUILD-SPEC §8).
      beforeDashboard: ['@/components/admin/ThisWeek#ThisWeek'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  // Admin sidebar order follows this list.
  collections: [Articles, Videos, Media, TeamMembers, Testimonials, Users],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  upload: {
    limits: {
      fileSize: MAX_UPLOAD_BYTES,
    },
  },
  // Deployment depends on this plugin: never remove it or swap in local disk storage.
  plugins: [
    s3Storage({
      bucket: s3.bucket,
      // DECISION: the admin uploads files straight from the browser to the bucket via a signed URL
      // (Payload checks the user, file type and MAX_UPLOAD_BYTES first; R2 enforces the signed
      // size). Netlify Functions cap request bodies at ~4.5 MB of binary data, which rules out
      // proxying larger images through Payload's API. Needs a bucket CORS rule allowing PUT from
      // the site's origins — see docs/DEPLOYMENT-NETLIFY.md §2.
      clientUploads: true,
      collections: {
        media: {
          // DECISION: serve files straight from the bucket's public URL rather than proxying them
          // through Payload's /api/media/file route. Media is public-read anyway, and this keeps
          // image traffic off Netlify functions.
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) => publicFileURL(s3.publicUrl, filename, prefix),
        },
      },
      config: {
        endpoint: s3.endpoint,
        region: s3.region,
        credentials: {
          accessKeyId: s3.accessKeyId,
          secretAccessKey: s3.secretAccessKey,
        },
        // DECISION: path-style requests keep every call on the account endpoint host
        // (<account>.r2.cloudflarestorage.com) instead of a per-bucket subdomain.
        forcePathStyle: true,
      },
    }),
  ],
})
