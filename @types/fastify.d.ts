import * as jsonwebtoken from 'jsonwebtoken';
import { AxiosInstance } from 'axios';

declare module 'fastify' {
  interface FastifyInstance {
    jwt: jsonwebtoken
    authenticate: any
    postgrest: any
  }

  interface FastifyRequest {
    jwtVerify: any
    user: any
  }

}
