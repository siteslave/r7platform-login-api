import fastify from 'fastify'
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
app.register(require('@fastify/cors'), {
  origin: 'https://r7.moph.go.th',
  methods: ['GET', 'POST'],
})

// Rate limit
const Redis = require('ioredis')
const redis = new Redis({
  connectionName: 'login-redis',
  host: process.env.R7PLATFORM_LOGIN_REDIS_RATELIMIT_HOST || 'localhost',
  port: Number(process.env.R7PLATFORM_LOGIN_REDIS_RATELIMIT_PORT) || 6379,
  password: process.env.R7PLATFORM_LOGIN_REDIS_RATELIMIT_PASSWORD || '',
  connectTimeout: 500,
  maxRetriesPerRequest: 1
})
app.register(import('@fastify/rate-limit'), {
  global: true,
  nameSpace: 'r7platform-login-ratelimit-',
  max: 1000,
  timeWindow: '1h',
  ban: 3,
  keyGenerator: (request: any) => {
    return request.headers['x-real-ip'];
  },
  redis: redis
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
      max: Number(process.env.R7PLATFORM_LOGIN_DB_POOL_MAX) || 10
    },
    debug: process.env.R7PLATFORM_LOGIN_DB_DEBUG === "Y" ? true : false,
  }
})

// JWT for Login
app.register(require("@fastify/jwt"),
  {
    namespace: 'login',
    decoratorName: 'authenticate',
    secret: process.env.R7PLATFORM_LOGIN_SECRET_KEY,
    sign: {
      iss: 'r7platform.moph.go.th',
      expiresIn: '1h'
    },
    messages: {
      badRequestErrorMessage: 'Format is Authorization: Bearer [token]',
      noAuthorizationInHeaderMessage: 'Autorization header is missing!',
      authorizationTokenExpiredMessage: 'Authorization token expired',
      authorizationTokenInvalid: (err: any) => {
        return `Authorization token is invalid: ${err.message}`
      }
    }

  });

// JWT for Send data
app.register(require("@fastify/jwt"), {
  namespace: 'send',
  decoratorName: 'sendauth',
  secret: process.env.R7PLATFORM_LOGIN_SEND_SECRET_KEY,
  sign: {
    iss: 'r7platform-send.moph.go.th',
    expiresIn: '1h'
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

app.addHook('onSend', (_request: any, reply: any, _playload: any, done: any) => {
  reply.headers({
    'X-Powered-By': 'R7 Health Platform System',
    'X-Processed-By': process.env.R7PLATFORM_LOGIN_HOSTNAME || 'dummy-server',
  })

  done()

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
app.register(require("./routes/login"), { prefix: '/' })
app.register(require("./routes/token"), { prefix: '/token' })
app.register(require("./routes/info"), { prefix: '/info' })
app.register(require("./routes/health_check"), { prefix: '/health-check' })

export default app
