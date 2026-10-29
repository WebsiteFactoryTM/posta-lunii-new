import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Images are local .webp files in /public/assets — Next still re-encodes and
  // serves responsive sizes for them, which is where the mobile win is.
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 90],
    deviceSizes: [360, 420, 640, 750, 828, 1080, 1200, 1600, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 200, 256, 320, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },
  poweredByHeader: false,
  compress: true,
  async headers() {
    return [
      {
        source: '/assets/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
