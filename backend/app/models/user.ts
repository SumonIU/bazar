import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasOne } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import SellerProfile from '#models/seller_profile'
import CustomerProfile from '#models/customer_profile'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email', 'phone'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'full_name' })
  declare fullName: string

  @column()
  declare email: string | null

  @column()
  declare phone: string | null

  @column()
  declare role: 'seller' | 'customer' | 'admin'

  @column({ serializeAs: null })
  declare password: string

  @hasOne(() => SellerProfile)
  declare sellerProfile: HasOne<typeof SellerProfile>

  @hasOne(() => CustomerProfile)
  declare customerProfile: HasOne<typeof CustomerProfile>

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime | null
}
