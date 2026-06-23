import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'onvdddlkrlwaxwufgodq.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Allow builds even with type warnings
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
