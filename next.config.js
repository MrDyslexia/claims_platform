/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow remote origin to load dev assets until Next.js enforces explicit allowlist
  allowedDevOrigins: ['https://canaldenuncias.appsbelator.cl','canaldenuncias.appsbelator.cl','http://canaldenuncias.appsbelator.cl'],
};

module.exports = nextConfig;

