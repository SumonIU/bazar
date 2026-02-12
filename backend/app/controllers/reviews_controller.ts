import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import Review from '#models/review'

const reviewValidator = vine.compile(
  vine.object({
    productId: vine.number().min(1),
    sellerId: vine.number().min(1),
    rating: vine.number().min(1).max(5),
    comment: vine.string().trim().optional(),
  })
)

export default class ReviewsController {
  async store({ auth, request, response }: HttpContext) {
    const user = auth.user
    if (!user || user.role !== 'customer') {
      return response.unauthorized({ message: 'Customer access only.' })
    }

    const payload = await request.validateUsing(reviewValidator)

    const review = await Review.create({
      productId: payload.productId,
      sellerId: payload.sellerId,
      customerId: user.id,
      rating: payload.rating,
      comment: payload.comment ?? null,
    })

    return response.created(review)
  }
}
