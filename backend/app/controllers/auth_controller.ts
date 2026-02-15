import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import User from '#models/user'
import CustomerProfile from '#models/customer_profile'

const registerCustomerValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim(),
    phone: vine.string().trim(),
    email: vine.string().trim().email(),
    password: vine.string().minLength(6),
  })
)

const loginValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email().optional(),
    phone: vine.string().trim().optional(),
    password: vine.string().minLength(6),
  })
)

const updateProfileValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().optional(),
    phone: vine.string().trim().optional(),
  })
)

export default class AuthController {
  async registerCustomer({ request, response }: HttpContext) {
    const payload = await request.validateUsing(registerCustomerValidator)

    const user = await User.create({
      fullName: payload.fullName,
      phone: payload.phone,
      email: payload.email,
      password: payload.password,
      role: 'customer',
    })

    const customerProfile = await CustomerProfile.create({
      userId: user.id,
      defaultAddress: null,
    })

    return response.created({ user, customerProfile })
  }

  async login({ request, auth, response }: HttpContext) {
    const payload = await request.validateUsing(loginValidator)
    const identifier = payload.email ?? payload.phone

    if (!identifier) {
      return response.badRequest({ message: 'Email or phone is required.' })
    }

    const user = await User.verifyCredentials(identifier, payload.password)

    if (!user) {
      return response.unauthorized({ message: 'Invalid credentials.' })
    }
    await auth.use('web').login(user)

    const redirectTo =
      user.role === 'admin' ? '/admin' : user.role === 'seller' ? '/dashboard/seller' : '/'

    return response.ok({ user, redirectTo })
  }

  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.ok({ message: 'Logged out.' })
  }

  async me({ auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Unauthorized' })
    }

    await user.load('sellerProfile')
    await user.load('customerProfile')

    return response.ok({ user })
  }

  async updateProfile({ auth, request, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Unauthorized' })
    }

    const payload = await request.validateUsing(updateProfileValidator)

    if (payload.fullName) {
      user.fullName = payload.fullName
    }
    if (payload.phone) {
      user.phone = payload.phone
    }

    await user.save()
    await user.load('sellerProfile')
    await user.load('customerProfile')

    return response.ok({ user })
  }
}
