/** @type {import('next').NextConfig} */
const nextConfig = {
    serverExternalPackages: ['@prisma/client'] // Исправлено для Next.js 15
  }
  
  module.exports = nextConfig