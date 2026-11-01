import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

import { LEGACY_REDIRECTS } from './src/lib/redirects'
import { readS3PublicUrl } from './src/lib/storage'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  // DECISION: stop `next dev` from appending its own agent rules to AGENTS.md; that file is
  // curated project guidance and should only change in reviewed commits.
  agentRules: false,
  images: {
    // Only these hosts (BUILD-SPEC §11.10): uploaded media, served from the bucket's public URL
    // (see payload.config.ts), and YouTube thumbnails for video facades.
    remotePatterns: [new URL(`${readS3PublicUrl()}/**`), new URL('https://i.ytimg.com/vi/**')],
  },
  // Old Squarespace URLs, maintained in one place.
  redirects: async () => LEGACY_REDIRECTS,
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
