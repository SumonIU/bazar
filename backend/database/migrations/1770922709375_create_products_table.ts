import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'products'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('seller_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.string('name').notNullable()
      table.text('nutrition_info').nullable()
      table.json('images').nullable()
      table.decimal('price', 10, 2).notNullable()
      table.string('unit').notNullable()
      table.integer('quantity').notNullable()
      table.text('description').nullable()
      table.enum('status', ['in_stock', 'out_of_stock']).defaultTo('in_stock')
      table.timestamp('posted_at', { useTz: true }).nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
