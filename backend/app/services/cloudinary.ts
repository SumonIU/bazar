import { v2 as cloudinary } from 'cloudinary'
import env from '#start/env'

const cloudName = env.get('CLOUDINARY_CLOUD_NAME')
const apiKey = env.get('CLOUDINARY_API_KEY')
const apiSecret = env.get('CLOUDINARY_API_SECRET')

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  })
}

export function isCloudinaryConfigured() {
  return Boolean(cloudName && apiKey && apiSecret)
}

export default cloudinary
