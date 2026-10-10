const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'fwiewovq'

export function cloudinaryImage(publicId: string) {
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${publicId}`
}

export const heroVideoUrls = {
  landscape: process.env.NEXT_PUBLIC_HERO_VIDEO_URL || '/videos/njd-landscape.mp4',
  portrait: process.env.NEXT_PUBLIC_HERO_VIDEO_PORTRAIT_URL || '/videos/njd-portrait.mp4',
}
