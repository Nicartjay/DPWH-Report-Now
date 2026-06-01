/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable React strict mode to avoid double rendering
  reactStrictMode: false,
  // Disable SWC minification for static files
  swcMinify: false,
  // Serve static files from public directory (Next.js default behavior)
  // No rewrites needed - Next.js automatically serves public/ at root
};

module.exports = nextConfig;

// Made with Bob
