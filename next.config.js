/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable React strict mode to avoid double rendering
  reactStrictMode: false,
  // Proxy DPWH API requests to bypass CORS
  // The rewrite forwards client headers (including cookies from Cloudflare challenges)
  async rewrites() {
    return [
      {
        source: '/api/dpwh/:path*',
        destination: 'https://api.transparency.dpwh.gov.ph/:path*',
      },
    ];
  },
};

module.exports = nextConfig;

// Made with Bob
