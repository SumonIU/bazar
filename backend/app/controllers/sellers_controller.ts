import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import SellerProfile from '#models/seller_profile'
import Product from '#models/product'
import Review from '#models/review'

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

  async dashboard({ auth, response }: HttpContext) {
    const user = auth.user
    if (!user || user.role !== 'seller') {
      return response.unauthorized({ message: 'Seller access only.' })
    }

    const activeListingsResult = await Product.query()
      .where('seller_id', user.id)
      .where('status', 'in_stock')
      .count('* as total')

    const ratingResult = await Review.query().where('seller_id', user.id).avg('rating as avg')

    const startOfDay = DateTime.local().startOf('day').toJSDate()
    const endOfDay = DateTime.local().endOf('day').toJSDate()

    const ordersTodayResult = await db
      .from('order_items')
      .join('products', 'order_items.product_id', 'products.id')
      .join('orders', 'order_items.order_id', 'orders.id')
      .where('products.seller_id', user.id)
      .whereBetween('orders.created_at', [startOfDay, endOfDay])
      .countDistinct('order_items.order_id as total')

    const recentItems = await Product.query()
      .where('seller_id', user.id)
      .orderBy('created_at', 'desc')
      .limit(3)

    const activeListings = Number(activeListingsResult[0].$extras.total ?? 0)
    const ratingRaw = ratingResult[0].$extras.avg
    const rating = ratingRaw ? Number(ratingRaw) : 0
    const ordersToday = Number(ordersTodayResult[0].total ?? 0)

    return response.ok({
      stats: {
        activeListings,
        ordersToday,
        rating,
      },
      recentItems,
    })
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
