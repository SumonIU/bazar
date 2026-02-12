import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import { DateTime } from 'luxon'
import Product from '#models/product'

const productValidator = vine.compile(
  vine.object({
    name: vine.string().trim(),
    nutritionInfo: vine.string().trim().optional(),
    images: vine.array(vine.string().trim()).optional(),
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
    images: vine.array(vine.string().trim()).optional(),
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

  async show({ params, response }: HttpContext) {
    const product = await Product.query().where('id', params.id).preload('seller').first()

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
      images: payload.images ?? [],
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
      images: payload.images ?? product.images,
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
