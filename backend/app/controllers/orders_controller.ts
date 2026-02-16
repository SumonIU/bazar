import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import Order from '#models/order'
import OrderItem from '#models/order_item'
import Product from '#models/product'

const orderValidator = vine.compile(
  vine.object({
    deliveryAddress: vine.string().trim(),
    phone: vine.string().trim(),
    paymentMethod: vine.string().trim(),
    items: vine.array(
      vine.object({
        productId: vine.number().min(1),
        quantity: vine.number().min(1),
        unitPrice: vine.number().min(1),
      })
    ),
  })
)

const orderStatusValidator = vine.compile(
  vine.object({
    status: vine.enum(['pending', 'in_delivery', 'completed', 'cancelled'] as const),
  })
)

export default class OrdersController {
  async sellerIndex({ auth, response }: HttpContext) {
    const user = auth.user
    if (!user || user.role !== 'seller') {
      return response.unauthorized({ message: 'Seller access only.' })
    }

    return Order.query()
      .whereHas('items', (itemsQuery) => {
        itemsQuery.whereHas('product', (productQuery) => {
          productQuery.where('seller_id', user.id)
        })
      })
      .preload('customer')
      .preload('items', (itemsQuery) => {
        itemsQuery
          .whereHas('product', (productQuery) => {
            productQuery.where('seller_id', user.id)
          })
          .preload('product')
      })
      .orderBy('created_at', 'desc')
  }

  async index({ auth, response }: HttpContext) {
    const user = auth.user
    if (!user || user.role !== 'customer') {
      return response.unauthorized({ message: 'Customer access only.' })
    }

    return Order.query().where('customer_id', user.id).preload('items')
  }

  async placeOrder({ auth, request, response }: HttpContext) {
    const user = auth.user
    if (!user || user.role !== 'customer') {
      return response.unauthorized({ message: 'Customer access only.' })
    }

    const payload = await request.validateUsing(orderValidator)

    const ordersWithItems: Array<{ order: Order; items: OrderItem[] }> = []

    for (const item of payload.items) {
      const quantity = Math.max(1, Math.floor(item.quantity))

      for (let index = 0; index < quantity; index += 1) {
        const total = item.unitPrice
        const order = await Order.create({
          customerId: user.id,
          status: 'pending',
          paymentMethod: payload.paymentMethod,
          paymentStatus: 'pending',
          total,
          deliveryAddress: payload.deliveryAddress,
          phone: payload.phone,
          receiptUrl: null,
        })

        const orderItem = await OrderItem.create({
          orderId: order.id,
          productId: item.productId,
          quantity: 1,
          unitPrice: item.unitPrice,
        })

        ordersWithItems.push({ order, items: [orderItem] })
      }
    }

    // Update product quantities and status
    for (const item of payload.items) {
      const product = await Product.find(item.productId)
      if (product) {
        product.quantity = Math.max(0, product.quantity - item.quantity)
        if (product.quantity === 0) {
          product.status = 'out_of_stock'
        }
        await product.save()
      }
    }

    return response.created({ orders: ordersWithItems })
  }

  async updateStatus({ auth, params, request, response }: HttpContext) {
    const user = auth.user
    if (!user || user.role !== 'seller') {
      return response.unauthorized({ message: 'Seller access only.' })
    }

    const payload = await request.validateUsing(orderStatusValidator)

    const order = await Order.query()
      .where('id', params.id)
      .preload('items', (itemsQuery) => itemsQuery.preload('product'))
      .first()
    if (!order) {
      return response.notFound({ message: 'Order not found.' })
    }

    const sellerItems = order.items.filter((item) => item.product?.sellerId === user.id)
    if (sellerItems.length === 0) {
      return response.unauthorized({ message: 'Seller access only.' })
    }

    order.status = payload.status
    await order.save()

    return order
  }

  async cancel({ auth, params, response }: HttpContext) {
    const user = auth.user
    if (!user || user.role !== 'customer') {
      return response.unauthorized({ message: 'Customer access only.' })
    }

    const order = await Order.query().where('id', params.id).where('customer_id', user.id).first()
    if (!order) {
      return response.notFound({ message: 'Order not found.' })
    }

    if (order.status !== 'pending') {
      return response.badRequest({ message: 'Only pending orders can be cancelled.' })
    }

    order.status = 'cancelled'
    await order.save()

    return order
  }
}
