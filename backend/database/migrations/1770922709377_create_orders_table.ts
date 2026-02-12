import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'orders'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('customer_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table
        .enum('status', ['pending', 'in_delivery', 'completed', 'cancelled'])
        .defaultTo('pending')
      table.string('payment_method').notNullable()
      table.enum('payment_status', ['pending', 'paid', 'failed']).defaultTo('pending')
      table.decimal('total', 10, 2).notNullable()
      table.text('delivery_address').notNullable()
      table.string('phone', 30).notNullable()
      table.text('receipt_url').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
