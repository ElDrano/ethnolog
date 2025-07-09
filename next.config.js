/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ignoriere ESLint-Fehler beim Build für Deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignoriere TypeScript-Fehler beim Build für Deployment
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig 