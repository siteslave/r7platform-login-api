import * as jsonwebtoken from 'jsonwebtoken'
import { AxiosInstance } from 'axios'
import Knex from 'knex'

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: any
    db: Knex
    hashPassword(password): Promise<string>
    verifyPassword(password, hash): Promise<boolean>
  }

  interface FastifyRequest {
    loginJwtVerify: any
    sendJwtVerify: any
    user: any
  }

  interface FastifyReply {
    loginJwtSign: any
    sendJwtSign: any
    user: any
  }

}
