import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import SellerProfile from '#models/seller_profile'

const updateProfileValidator = vine.compile(
  vine.object({
    shopName: vine.string().trim().optional(),
    division: vine.string().trim().optional(),
    district: vine.string().trim().optional(),
    area: vine.string().trim().optional(),
  })
)

export default class SellersController {
  async index() {
    return SellerProfile.query().preload('user')
  }

  async show({ params, response }: HttpContext) {
    const seller = await SellerProfile.query().where('id', params.id).preload('user').first()

    if (!seller) {
      return response.notFound({ message: 'Seller not found.' })
    }

    return seller
  }

  async updateProfile({ auth, request, response }: HttpContext) {
    const user = auth.user
    if (!user || user.role !== 'seller') {
      return response.unauthorized({ message: 'Seller access only.' })
    }

    const payload = await request.validateUsing(updateProfileValidator)

    const profile = await SellerProfile.findByOrFail('user_id', user.id)
    profile.merge(payload)
    await profile.save()

    return profile
  }
}
