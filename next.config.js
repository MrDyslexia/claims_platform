/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow remote origin to load dev assets until Next.js enforces explicit allowlist
  allowedDevOrigins: ['https://m4.blocktype.cl','m4.blocktype.cl','http://m4.blocktype.cl'],
  output: 'export',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
