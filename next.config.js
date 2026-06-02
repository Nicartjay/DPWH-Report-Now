/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable React strict mode to avoid double rendering
  reactStrictMode: false,
};

module.exports = nextConfig;


import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
