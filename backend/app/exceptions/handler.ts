import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    const dbError = error as {
      code?: string
      errno?: number
      message?: string
      sqlMessage?: string
      constraint?: string
      column?: string
    }

    if (this.isUniqueConstraintError(dbError)) {
      const field = this.getUniqueField(dbError)
      const fieldLabel = field ? this.labelize(field) : 'Value'

      return ctx.response.conflict({
        message: `${fieldLabel} already exists.`,
      })
    }

    return super.handle(error, ctx)
  }

  /**
   * The method is used to report error to the logging service or
   * the third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }

  private isUniqueConstraintError(error: {
    code?: string
    errno?: number
    message?: string
    sqlMessage?: string
  }) {
    return (
      error.code === 'ER_DUP_ENTRY' ||
      error.code === 'SQLITE_CONSTRAINT' ||
      error.code === '23505' ||
      error.errno === 1062 ||
      (error.message ?? '').toLowerCase().includes('unique') ||
      (error.sqlMessage ?? '').toLowerCase().includes('unique')
    )
  }

  private getUniqueField(error: { message?: string; sqlMessage?: string; constraint?: string }) {
    const source = [error.constraint, error.sqlMessage, error.message]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const keyMatch = source.match(/users_(email|phone)_unique/)
    if (keyMatch) {
      return keyMatch[1]
    }

    const columnMatch = source.match(/\b(email|phone)\b/)
    if (columnMatch) {
      return columnMatch[1]
    }

    return null
  }

  private labelize(value: string) {
    return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
  }
}
