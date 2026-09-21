/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["bcryptjs"],
  },
  eslint: {
    // Pre-existing UI pages use `any`; typecheck still runs via tsc.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
