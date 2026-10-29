/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Allow next/image to optimize images served from the Supabase storage
    // bucket. The hostname below is this project's Supabase ref; swap if the
    // project changes.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pwjxrbzmflpepjtxogjv.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  transpilePackages: ['three'],
};

module.exports = nextConfig;
