const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'fwiewovq'

export function cloudinaryImage(publicId: string) {
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${publicId}`
}

export const heroVideoUrl =
  process.env.NEXT_PUBLIC_HERO_VIDEO_URL ||
  `https://res.cloudinary.com/${cloudName}/video/upload/f_auto,q_auto/not-just-dark/videos/njd-campaign-film.mp4`
