import * as jsonwebtoken from 'jsonwebtoken'
import { AxiosInstance } from 'axios'
import Knex from 'knex'

declare module 'fastify' {
  interface FastifyInstance {
    jwt: jsonwebtoken
    authenticate: any
    db: Knex
    hashPassword(password): Promise<string>
    verifyPassword(password, hash): Promise<boolean>
  }

  interface FastifyRequest {
    jwtVerify: any
    user: any
  }

}
