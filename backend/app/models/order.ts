import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import OrderItem from '#models/order_item'

export default class Order extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'customer_id' })
  declare customerId: number

  @column()
  declare status: 'pending' | 'in_delivery' | 'completed' | 'cancelled'

  @column({ columnName: 'payment_method' })
  declare paymentMethod: string

  @column({ columnName: 'payment_status' })
  declare paymentStatus: 'pending' | 'paid' | 'failed'

  @column()
  declare total: number

  @column({ columnName: 'delivery_address' })
  declare deliveryAddress: string

  @column()
  declare phone: string

  @column({ columnName: 'receipt_url' })
  declare receiptUrl: string | null

  @belongsTo(() => User, { foreignKey: 'customerId' })
  declare customer: BelongsTo<typeof User>

  @hasMany(() => OrderItem)
  declare items: HasMany<typeof OrderItem>

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime
}
