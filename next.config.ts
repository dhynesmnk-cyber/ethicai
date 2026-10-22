import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

import { readS3PublicUrl } from './src/lib/storage'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  // DECISION: stop `next dev` from appending its own agent rules to AGENTS.md; that file is
  // curated project guidance and should only change in reviewed commits.
  agentRules: false,
  images: {
    // Uploaded media is served from the bucket's public URL (see payload.config.ts).
    remotePatterns: [new URL(`${readS3PublicUrl()}/**`)],
  },
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
