import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  StatusCodes,
  getReasonPhrase,
} from 'http-status-codes'

const randomstring = require('randomstring')

import { LoginModel } from '../models/login'
import { TokenModel } from '../models/token'

import loginSchema from '../schema/login'


export default async (fastify: FastifyInstance) => {

  const loginModel = new LoginModel()
  const tokenModel = new TokenModel()

  const db = fastify.db

  fastify.post('/login', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute'
      }
    },
    schema: loginSchema,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body: any = request.body;
    const username = body.username;
    const password = body.password;

    try {
      const hash: any = await fastify.hashPassword(password)
      const data: any = await loginModel.login(db, username, hash)
      if (data) {
        const payload: any = { sub: data.id, ingress_zone: data.ingress_zone, hospcode: data.hospcode }
        const access_token = fastify.jwt.sign(payload)
        const refresh_token = randomstring.generate(64)

        // save token
        await tokenModel.saveToken(db, data, refresh_token)

        reply
          .status(StatusCodes.OK)
          .send({ access_token, refresh_token })
      } else {
        reply
          .status(StatusCodes.UNAUTHORIZED)
          .send({
            code: StatusCodes.UNAUTHORIZED,
            error: getReasonPhrase(StatusCodes.UNAUTHORIZED)
          })
      }

    } catch (error: any) {
      request.log.error(error);
      reply
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({
          code: StatusCodes.INTERNAL_SERVER_ERROR,
          error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR)
        });
    }
  })

  fastify.get('/genpass', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute'
      }
    }
  }, async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const password: any = randomstring.generate(8)
      const hash: any = await fastify.hashPassword(password)
      reply.status(StatusCodes.OK).send({ password, hash })
    } catch (e) {
      console.error(e)
      reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send()
    }
  })

} 
