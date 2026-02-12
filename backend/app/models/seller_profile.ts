import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Product from '#models/product'
import Review from '#models/review'

export default class SellerProfile extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'user_id' })
  declare userId: number

  @column({ columnName: 'shop_name' })
  declare shopName: string

  @column({ columnName: 'shop_id' })
  declare shopId: string

  @column()
  declare division: string

  @column()
  declare district: string

  @column()
  declare area: string

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => Product)
  declare products: HasMany<typeof Product>

  @hasMany(() => Review)
  declare reviews: HasMany<typeof Review>

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime
}
