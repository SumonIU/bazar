import type { HttpContext } from '@adonisjs/core/http'
import cloudinary, { isCloudinaryConfigured } from '#services/cloudinary'

export default class UploadsController {
  async productImage({ auth, request, response }: HttpContext) {
    const user = auth.user
    if (!user || user.role !== 'seller') {
      return response.unauthorized({ message: 'Seller access only.' })
    }

    if (!isCloudinaryConfigured()) {
      return response.status(500).send({
        message:
          'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.',
      })
    }

    const imageFile = request.file('image', {
      extnames: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
      size: '8mb',
    })

    if (!imageFile) {
      return response.badRequest({ message: 'Image file is required.' })
    }

    if (!imageFile.isValid) {
      return response.badRequest({
        message: 'Invalid image file.',
        errors: imageFile.errors,
      })
    }

    if (!imageFile.tmpPath) {
      return response.status(500).send({ message: 'Failed to process uploaded image.' })
    }

    const uploadResult = await cloudinary.uploader.upload(imageFile.tmpPath, {
      folder: 'bazar/products',
      resource_type: 'image',
    })

    return response.created({
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    })
  }
}
