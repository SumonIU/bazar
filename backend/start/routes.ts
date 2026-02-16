/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const AuthController = () => import('#controllers/auth_controller')
const AdminController = () => import('#controllers/admin_controller')
const SellersController = () => import('#controllers/sellers_controller')
const ProductsController = () => import('#controllers/products_controller')
const ReviewsController = () => import('#controllers/reviews_controller')
const CartController = () => import('#controllers/cart_controller')
const OrdersController = () => import('#controllers/orders_controller')

router.get('/', async () => {
  return { status: 'ok', service: 'bazar-api' }
})

router
  .group(() => {
    router.post('auth/customer/register', [AuthController, 'registerCustomer'])
    router.post('auth/login', [AuthController, 'login'])
    router.post('auth/logout', [AuthController, 'logout']).use(middleware.auth())
    router.get('auth/me', [AuthController, 'me']).use(middleware.auth())
    router.put('auth/me', [AuthController, 'updateProfile']).use(middleware.auth())

    router.get('sellers', [SellersController, 'index'])
    router.get('sellers/:id', [SellersController, 'show'])
    router.get('sellers/:id/products', [ProductsController, 'sellerProductsPublic'])
    router.get('seller/dashboard', [SellersController, 'dashboard']).use(middleware.auth())
    router.put('sellers/profile', [SellersController, 'updateProfile']).use(middleware.auth())

    router.get('products', [ProductsController, 'index'])
    router.get('products/:id', [ProductsController, 'show'])
    router.get('seller/products', [ProductsController, 'sellerIndex']).use(middleware.auth())
    router.post('products', [ProductsController, 'store']).use(middleware.auth())
    router.put('products/:id', [ProductsController, 'update']).use(middleware.auth())
    router.delete('products/:id', [ProductsController, 'destroy']).use(middleware.auth())
    router
      .post('products/:id/out-of-stock', [ProductsController, 'markOutOfStock'])
      .use(middleware.auth())

    router.post('reviews', [ReviewsController, 'store']).use(middleware.auth())

    router.get('cart', [CartController, 'index']).use(middleware.auth())
    router.post('cart', [CartController, 'addItem']).use(middleware.auth())
    router.put('cart/:id', [CartController, 'updateItem']).use(middleware.auth())
    router.delete('cart/:id', [CartController, 'removeItem']).use(middleware.auth())

    router.get('orders', [OrdersController, 'index']).use(middleware.auth())
    router.get('seller/orders', [OrdersController, 'sellerIndex']).use(middleware.auth())
    router.post('orders', [OrdersController, 'placeOrder']).use(middleware.auth())
    router.patch('orders/:id/status', [OrdersController, 'updateStatus']).use(middleware.auth())

    router.get('admin/stats', [AdminController, 'stats']).use(middleware.auth())
    router.get('admin/reviews', [AdminController, 'recentReviews']).use(middleware.auth())
    router
      .get('admin/sellers/:id/products', [ProductsController, 'adminSellerProducts'])
      .use(middleware.auth())
    router.delete('admin/sellers/:id', [AdminController, 'deleteSeller']).use(middleware.auth())
    router.delete('admin/products/:id', [ProductsController, 'adminDestroy']).use(middleware.auth())
    router.post('admin/sellers', [AdminController, 'createSeller']).use(middleware.auth())
  })
  .prefix('api')
