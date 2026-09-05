/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "coresg-normal.trae.ai" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "d2f5cg397c40hu.cloudfront.net" },
    ],
  },
  experimental: {
    typedRoutes: false,
  },
};

module.exports = nextConfig;
