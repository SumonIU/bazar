import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import CartItem from '#models/cart_item'

const cartItemValidator = vine.compile(
  vine.object({
    productId: vine.number().min(1),
    quantity: vine.number().min(1),
  })
)

const cartItemUpdateValidator = vine.compile(
  vine.object({
    quantity: vine.number().min(1),
  })
)

export default class CartController {
  async index({ auth, response }: HttpContext) {
    const user = auth.user
    if (!user || user.role !== 'customer') {
      return response.unauthorized({ message: 'Customer access only.' })
    }

    const items = await CartItem.query().where('customer_id', user.id).preload('product')
    return items
  }

  async addItem({ auth, request, response }: HttpContext) {
    const user = auth.user
    if (!user || user.role !== 'customer') {
      return response.unauthorized({ message: 'Customer access only.' })
    }

    const payload = await request.validateUsing(cartItemValidator)

    const existing = await CartItem.query()
      .where('customer_id', user.id)
      .where('product_id', payload.productId)
      .first()

    if (existing) {
      existing.quantity += payload.quantity
      await existing.save()
      return response.ok(existing)
    }

    const item = await CartItem.create({
      customerId: user.id,
      productId: payload.productId,
      quantity: payload.quantity,
    })

    return response.created(item)
  }

  async updateItem({ auth, request, params, response }: HttpContext) {
    const user = auth.user
    if (!user || user.role !== 'customer') {
      return response.unauthorized({ message: 'Customer access only.' })
    }

    const payload = await request.validateUsing(cartItemUpdateValidator)

    const item = await CartItem.query().where('id', params.id).where('customer_id', user.id).first()

    if (!item) {
      return response.notFound({ message: 'Cart item not found.' })
    }

    item.quantity = payload.quantity
    await item.save()

    return item
  }

  async removeItem({ auth, params, response }: HttpContext) {
    const user = auth.user
    if (!user || user.role !== 'customer') {
      return response.unauthorized({ message: 'Customer access only.' })
    }

    const item = await CartItem.query().where('id', params.id).where('customer_id', user.id).first()

    if (!item) {
      return response.notFound({ message: 'Cart item not found.' })
    }

    await item.delete()
    return response.ok({ message: 'Removed from cart.' })
  }
}
