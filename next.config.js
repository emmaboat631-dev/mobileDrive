/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [],
  },
  transpilePackages: ['three'],
};

module.exports = nextConfig;
