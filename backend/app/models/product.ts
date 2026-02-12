import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class Product extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'seller_id' })
  declare sellerId: number

  @column()
  declare name: string

  @column({ columnName: 'nutrition_info' })
  declare nutritionInfo: string | null

  @column({
    prepare: (value: string[] | null) => JSON.stringify(value ?? []),
    consume: (value: string | null) => (value ? JSON.parse(value) : []),
  })
  declare images: string[]

  @column()
  declare price: number

  @column()
  declare unit: string

  @column()
  declare quantity: number

  @column()
  declare description: string | null

  @column()
  declare status: 'in_stock' | 'out_of_stock'

  @column.dateTime({ columnName: 'posted_at' })
  declare postedAt: DateTime | null

  @belongsTo(() => User)
  declare seller: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime
}
