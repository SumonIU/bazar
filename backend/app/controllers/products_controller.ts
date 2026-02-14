import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import { DateTime } from 'luxon'
import Product from '#models/product'
import SellerProfile from '#models/seller_profile'

const productValidator = vine.compile(
  vine.object({
    name: vine.string().trim(),
    nutritionInfo: vine.string().trim().optional(),
    image: vine.string().trim().optional(),
    price: vine.number().min(1),
    unit: vine.string().trim(),
    quantity: vine.number().min(1),
    description: vine.string().trim().optional(),
  })
)

const productUpdateValidator = vine.compile(
  vine.object({
    name: vine.string().trim().optional(),
    nutritionInfo: vine.string().trim().optional(),
    image: vine.string().trim().optional(),
    price: vine.number().min(1).optional(),
    unit: vine.string().trim().optional(),
    quantity: vine.number().min(1).optional(),
    description: vine.string().trim().optional(),
    status: vine.enum(['in_stock', 'out_of_stock'] as const).optional(),
  })
)

export default class ProductsController {
  async index() {
    return Product.query().preload('seller')
  }

  async sellerIndex({ auth, response }: HttpContext) {
    const user = auth.user
    if (!user || user.role !== 'seller') {
      return response.unauthorized({ message: 'Seller access only.' })
    }

    return Product.query().where('seller_id', user.id).orderBy('created_at', 'desc')
  }

  async adminSellerProducts({ auth, params, response }: HttpContext) {
    const user = auth.user
    if (!user || user.role !== 'admin') {
      return response.unauthorized({ message: 'Admin access only.' })
    }

    const sellerProfile = await SellerProfile.find(params.id)

    if (!sellerProfile) {
      return response.notFound({ message: 'Seller not found.' })
    }

    return Product.query().where('seller_id', sellerProfile.userId).orderBy('created_at', 'desc')
  }

  async show({ params, response }: HttpContext) {
    const product = await Product.query()
      .where('id', params.id)
      .preload('seller')
      .preload('reviews', (query) => query.preload('customer').orderBy('created_at', 'desc'))
      .first()

    if (!product) {
      return response.notFound({ message: 'Product not found.' })
    }

    return product
  }

  async store({ auth, request, response }: HttpContext) {
    const user = auth.user
    if (!user || user.role !== 'seller') {
      return response.unauthorized({ message: 'Seller access only.' })
    }

    const payload = await request.validateUsing(productValidator)

    const product = await Product.create({
      sellerId: user.id,
      name: payload.name,
      nutritionInfo: payload.nutritionInfo ?? null,
      image: payload.image ?? null,
      price: payload.price,
      unit: payload.unit,
      quantity: payload.quantity,
      description: payload.description ?? null,
      status: 'in_stock',
      postedAt: DateTime.local(),
    })

    return response.created(product)
  }

  async update({ auth, request, response, params }: HttpContext) {
    const user = auth.user
    if (!user || user.role !== 'seller') {
      return response.unauthorized({ message: 'Seller access only.' })
    }

    const payload = await request.validateUsing(productUpdateValidator)

    const product = await Product.query().where('id', params.id).where('seller_id', user.id).first()

    if (!product) {
      return response.notFound({ message: 'Product not found.' })
    }

    product.merge({
      ...payload,
      image: payload.image ?? product.image,
      nutritionInfo: payload.nutritionInfo ?? product.nutritionInfo,
    })
    await product.save()

    return product
  }

  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.user
    if (!user || user.role !== 'seller') {
      return response.unauthorized({ message: 'Seller access only.' })
    }

    const product = await Product.query().where('id', params.id).where('seller_id', user.id).first()

    if (!product) {
      return response.notFound({ message: 'Product not found.' })
    }

    await product.delete()
    return response.ok({ message: 'Product deleted.' })
  }

  async adminDestroy({ auth, params, response }: HttpContext) {
    const user = auth.user
    if (!user || user.role !== 'admin') {
      return response.unauthorized({ message: 'Admin access only.' })
    }

    const product = await Product.find(params.id)

    if (!product) {
      return response.notFound({ message: 'Product not found.' })
    }

    await product.delete()
    return response.ok({ message: 'Product deleted.' })
  }

  async markOutOfStock({ auth, params, response }: HttpContext) {
    const user = auth.user
    if (!user || user.role !== 'seller') {
      return response.unauthorized({ message: 'Seller access only.' })
    }

    const product = await Product.query().where('id', params.id).where('seller_id', user.id).first()

    if (!product) {
      return response.notFound({ message: 'Product not found.' })
    }

    product.status = 'out_of_stock'
    await product.save()

    return product
  }
}
