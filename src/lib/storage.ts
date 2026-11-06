// Media storage settings for S3-compatible object storage (Cloudflare R2).
// Local disk storage is never an option: Netlify's filesystem is ephemeral, so every upload
// must land in the bucket. Missing settings fail loudly instead of silently falling back to disk.

const REQUIRED_S3_ENV = [
  'S3_BUCKET',
  'S3_ENDPOINT',
  'S3_ACCESS_KEY_ID',
  'S3_SECRET_ACCESS_KEY',
  'S3_PUBLIC_URL',
] as const

export type S3Settings = {
  bucket: string
  endpoint: string
  region: string
  accessKeyId: string
  secretAccessKey: string
  /** Public base URL for the bucket (r2.dev or custom domain), no trailing slash. */
  publicUrl: string
}

type Env = Record<string, string | undefined>

export function readS3Settings(env: Env = process.env): S3Settings {
  const missing = REQUIRED_S3_ENV.filter((key) => !env[key])
  if (missing.length > 0) {
    throw new Error(
      `Media storage is not configured: missing ${missing.join(', ')}. ` +
        'Uploads must go to S3/R2 — see .env.example.',
    )
  }

  return {
    bucket: env.S3_BUCKET as string,
    // Cloudflare's dashboard shows the S3 API URL with the bucket appended
    // (https://<account>.r2.cloudflarestorage.com/<bucket>). The SDK adds the bucket itself, so
    // keep only the origin or every key would be nested under an extra "<bucket>/" folder.
    endpoint: new URL(env.S3_ENDPOINT as string).origin,
    region: env.S3_REGION || 'auto',
    accessKeyId: env.S3_ACCESS_KEY_ID as string,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY as string,
    publicUrl: readS3PublicUrl(env),
  }
}

export function readS3PublicUrl(env: Env = process.env): string {
  const value = env.S3_PUBLIC_URL
  if (!value) {
    throw new Error('Media storage is not configured: missing S3_PUBLIC_URL — see .env.example.')
  }
  return value.replace(/\/+$/, '')
}

/** Public URL of a stored object, matching the key layout used by @payloadcms/storage-s3. */
export function publicFileURL(publicUrl: string, filename: string, prefix?: string): string {
  const key = [prefix, filename]
    .filter((part): part is string => Boolean(part))
    .map((part) => part.replace(/^\/+|\/+$/g, ''))
    .join('/')
  const encodedKey = key.split('/').map(encodeURIComponent).join('/')
  return `${publicUrl.replace(/\/+$/, '')}/${encodedKey}`
}
