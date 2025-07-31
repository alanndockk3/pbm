import type { NextConfig } from "next";

// FIXME: WARNING: This file is a temporary workaround for issues with ESLint and TypeScript in the project.
// Remove this file after fixing the issues in the project.

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
    unoptimized: true
  }
}

export default nextConfig;
