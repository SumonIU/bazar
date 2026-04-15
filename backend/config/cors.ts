import env from '#start/env'
import { defineConfig } from '@adonisjs/cors'

/**
 * Configuration options to tweak the CORS policy. The following
 * options are documented on the official documentation website.
 *
 * https://docs.adonisjs.com/guides/security/cors
 */
const configuredOrigins = (env.get('CORS_ORIGINS') || '')
  .split(',')
  .map((origin: string) => origin.trim())
  .filter(Boolean)

const explicitOrigins = [
  'http://localhost:3000',
  'https://bazar-syar.vercel.app',
  ...configuredOrigins,
]

const corsConfig = defineConfig({
  enabled: true,
  origin: (origin: string | undefined) => {
    if (!origin) {
      return true
    }

    if (explicitOrigins.includes(origin)) {
      return true
    }

    try {
      const hostname = new URL(origin).hostname
      return hostname.endsWith('.vercel.app')
    } catch {
      return false
    }
  },
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  headers: true,
  exposeHeaders: [],
  credentials: true,
  maxAge: 90,
})

export default corsConfig
