import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  StatusCodes,
  getReasonPhrase,
} from 'http-status-codes';

import * as crypto from 'crypto'

import { LoginModel } from '../models/login'

import loginSchema from '../schema/login';

export default async (fastify: FastifyInstance) => {

  const loginModel = new LoginModel();
  const postgrest = fastify.postgrest;

  fastify.post('/login', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute'
      }
    },
    schema: loginSchema,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body: any = request.body
    const username = body.username
    const password = body.password

    try {
      const encPassword = crypto.createHash('md5').update(password).digest('hex')
      const { data, error } = await loginModel.login(postgrest, username, encPassword)

      if (error) {
        reply
          .status(StatusCodes.BAD_REQUEST)
          .send(getReasonPhrase(StatusCodes.BAD_REQUEST))
      }

      if (data.length > 0) {
        const user: any = data[0]
        const payload: any = {
          sub: user.id
        }

        const token = fastify.jwt.sign(payload)
        reply
          .status(StatusCodes.OK)
          .send({ access_token: token })
      } else {
        reply
          .status(StatusCodes.UNAUTHORIZED)
          .send(getReasonPhrase(StatusCodes.UNAUTHORIZED))
      }
    } catch (error: any) {
      request.log.error(error);
      reply
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send(getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR))
    }
  })

} 
