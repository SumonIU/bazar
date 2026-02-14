import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Product from '#models/product'

export default class CartItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'customer_id' })
  declare customerId: number

  @column({ columnName: 'product_id' })
  declare productId: number

  @column()
  declare quantity: number

  @belongsTo(() => User, { foreignKey: 'customerId' })
  declare customer: BelongsTo<typeof User>

  @belongsTo(() => Product, { foreignKey: 'productId' })
  declare product: BelongsTo<typeof Product>

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime
}
