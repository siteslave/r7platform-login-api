import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import {
  StatusCodes,
  getReasonPhrase,
} from 'http-status-codes'
import _ from "lodash"

import { TokenModel } from '../models/token'

import tokenSchema from '../schema/token'
import introspectSchema from '../schema/introspect'


export default async (fastify: FastifyInstance) => {

  const tokenModel = new TokenModel()

  const db = fastify.db

  fastify.post('/refresh_token', {
    schema: tokenSchema,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body: any = request.body;
    const refreshToken = body.refresh_token;

    try {
      const data: any = await tokenModel.verifyToken(db, refreshToken)

      if (!_.isEmpty(data)) {
        const payload: any = { sub: data.user_id, ingress_zone: data.ingress_zone, hospcode: data.hospcode }
        const access_token = await reply.sendJwtSign(payload)

        reply
          .status(StatusCodes.OK)
          .send({ access_token })
      } else {
        reply
          .status(StatusCodes.UNAUTHORIZED)
          .send({
            code: StatusCodes.UNAUTHORIZED,
            error: getReasonPhrase(StatusCodes.UNAUTHORIZED)
          })
      }

    } catch (error: any) {
      request.log.error(error)
      reply
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({
          code: StatusCodes.INTERNAL_SERVER_ERROR,
          error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR)
        });
    }
  })

  fastify.post('/introspect', {
    schema: introspectSchema,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const decoded: any = await request.sendJwtVerify();
      reply
        .status(StatusCodes.OK)
        .send(decoded);
    } catch (error: any) {
      request.log.error(error)
      reply
        .status(StatusCodes.UNAUTHORIZED)
        .send({
          code: StatusCodes.UNAUTHORIZED,
          error: getReasonPhrase(StatusCodes.UNAUTHORIZED)
        })
    }
  })

} 
