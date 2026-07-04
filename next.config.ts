import type { NextConfig } from "next";

const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    outputFileTracingExcludes: {
      '*': ['./supabase/**/*'],
    },
  },
}

export default nextConfig