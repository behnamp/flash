import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  env: {
    // Fallback values if env vars not set on hosting platform
    // These are server-side only (no NEXT_PUBLIC_ prefix = not exposed to browser)
    STRIPE_SECRET_KEY_FALLBACK: process.env.STRIPE_SECRET_KEY || '',
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.cloudfront.net' },
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'cdn.higgsfield.ai' },
    ],
  },
}

export default nextConfig
