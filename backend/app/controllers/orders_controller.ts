import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import Order from '#models/order'
import OrderItem from '#models/order_item'

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

    const total = payload.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

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

    const orderItems = payload.items.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }))

    await OrderItem.createMany(orderItems)

    return response.created({ order, items: orderItems })
  }

  async updateStatus({ auth, params, request, response }: HttpContext) {
    const user = auth.user
    if (!user || user.role !== 'seller') {
      return response.unauthorized({ message: 'Seller access only.' })
    }

    const payload = await request.validateUsing(orderStatusValidator)

    const order = await Order.find(params.id)
    if (!order) {
      return response.notFound({ message: 'Order not found.' })
    }

    order.status = payload.status
    await order.save()

    return order
  }
}
