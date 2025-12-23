/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Enable faster navigation
  reactStrictMode: true,
  // Optimize production builds
  swcMinify: true,
}

export default nextConfig