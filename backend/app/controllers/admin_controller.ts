import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import User from '#models/user'
import Product from '#models/product'
import Review from '#models/review'
import SellerProfile from '#models/seller_profile'

const createSellerValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim(),
    shopName: vine.string().trim(),
    division: vine.string().trim(),
    district: vine.string().trim(),
    area: vine.string().trim(),
    phone: vine.string().trim(),
    email: vine.string().trim().email(),
    password: vine.string().minLength(6),
  })
)

export default class AdminController {
  async stats({ auth, response }: HttpContext) {
    const user = auth.user
    if (!user || user.role !== 'admin') {
      return response.unauthorized({ message: 'Admin access only.' })
    }

    const sellers = await User.query().where('role', 'seller').count('* as total')
    const customers = await User.query().where('role', 'customer').count('* as total')
    const products = await Product.query().count('* as total')
    const reviews = await Review.query().count('* as total')

    return {
      sellers: sellers[0].$extras.total,
      customers: customers[0].$extras.total,
      products: products[0].$extras.total,
      reviews: reviews[0].$extras.total,
    }
  }

  async createSeller({ auth, request, response }: HttpContext) {
    const user = auth.user
    if (!user || user.role !== 'admin') {
      return response.unauthorized({ message: 'Admin access only.' })
    }

    const payload = await request.validateUsing(createSellerValidator)

    const sellerUser = await User.create({
      fullName: payload.fullName,
      phone: payload.phone,
      email: payload.email,
      password: payload.password,
      role: 'seller',
    })

    const shopId = `SHOP-${Date.now().toString(36).toUpperCase()}`

    const sellerProfile = await SellerProfile.create({
      userId: sellerUser.id,
      shopName: payload.shopName,
      shopId,
      division: payload.division,
      district: payload.district,
      area: payload.area,
    })

    return response.created({ user: sellerUser, sellerProfile })
  }

  async recentReviews({ auth, response }: HttpContext) {
    const user = auth.user
    if (!user || user.role !== 'admin') {
      return response.unauthorized({ message: 'Admin access only.' })
    }

    const reviews = await Review.query()
      .preload('product')
      .preload('customer')
      .orderBy('created_at', 'desc')
      .limit(5)

    return response.ok(reviews)
  }

  async deleteSeller({ auth, params, response }: HttpContext) {
    const user = auth.user
    if (!user || user.role !== 'admin') {
      return response.unauthorized({ message: 'Admin access only.' })
    }

    const sellerProfile = await SellerProfile.query().where('id', params.id).first()
    if (!sellerProfile) {
      return response.notFound({ message: 'Seller not found.' })
    }

    const sellerUser = await User.findOrFail(sellerProfile.userId)
    if (sellerUser.role !== 'seller') {
      return response.badRequest({ message: 'User is not a seller.' })
    }

    await sellerUser.delete()

    return response.noContent()
  }
}
