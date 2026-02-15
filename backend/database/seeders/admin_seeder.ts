import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    await User.updateOrCreate(
      { email: 'admin@gmail.com' },
      {
        fullName: 'Admin User',
        email: 'admin@gmail.com',
        phone: '01700000000',
        password: 'admin123',
        role: 'admin',
      }
    )
  }
}
