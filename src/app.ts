import fastify from 'fastify'
import path from 'path'
const autoload = require('@fastify/autoload')
const bcrypt = require('bcrypt')

const app = fastify({
  logger: {
    transport:
      process.env.NODE_ENV === 'development'
        ? {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
            colorize: true
          }
        }
        : undefined
  }
})

// Plugins
app.register(require('@fastify/formbody'))
app.register(require('@fastify/cors'))

// Rate limit
app.register(import('@fastify/rate-limit'), {
  global: true,
  max: 5,
  timeWindow: '1 minute'
})

// Database
app.register(require('./plugins/db'), {
  options: {
    client: 'pg',
    connection: {
      host: process.env.R7PLATFORM_LOGIN_DB_HOST || 'localhost',
      user: process.env.R7PLATFORM_LOGIN_DB_USER || 'postgres',
      port: Number(process.env.R7PLATFORM_LOGIN_DB_PORT) || 5432,
      password: process.env.R7PLATFORM_LOGIN_DB_PASSWORD || '',
      database: process.env.R7PLATFORM_LOGIN_DB_NAME || 'test',
    },
    searchPath: [process.env.R7PLATFORM_LOGIN_DB_SCHEMA || 'public'],
    pool: {
      min: Number(process.env.R7PLATFORM_LOGIN_DB_POOL_MIN) || 0,
      max: Number(process.env.R7PLATFORM_LOGIN_DB_POOL_MAX) || 500
    },
    debug: process.env.R7PLATFORM_LOGIN_DB_DEBUG === "Y" ? true : false,
  }
})

// JWT
app.register(require('./plugins/jwt'), {
  secret: process.env.R7PLATFORM_LOGIN_SECRET_KEY || '@1234567890@',
  sign: {
    iss: 'r7.moph.go.th',
    expiresIn: '10m'
  },
  messages: {
    badRequestErrorMessage: 'Format is Authorization: Bearer [token]',
    noAuthorizationInHeaderMessage: 'Autorization header is missing!',
    authorizationTokenExpiredMessage: 'Authorization token expired',
    authorizationTokenInvalid: (err: any) => {
      return `Authorization token is invalid: ${err.message}`
    }
  }
})

// hash password
app.decorate('hashPassword', async (password: any) => {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
})

// verify password
app.decorate('verifyPassword', async (password: any, hash: any) => {
  return bcrypt.compare(password, hash)
})

// routes
app.register(autoload, {
  dir: path.join(__dirname, 'routes')
})

export default app
