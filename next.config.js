/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Cloudinary URLs already use f_auto,q_auto. Loading them directly avoids
    // proxying every asset through the Hostinger/Next.js server.
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
}

module.exports = nextConfig
