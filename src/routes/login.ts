import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import {
  StatusCodes,
  getReasonPhrase,
} from 'http-status-codes'

const randomstring = require('randomstring')

import { LoginModel } from '../models/login'
import { TokenModel } from '../models/token'

import loginSchema from '../schema/login'
import genpassSchema from '../schema/genpass'


export default async (fastify: FastifyInstance, _options: any, done: any) => {

  const loginModel = new LoginModel()
  const tokenModel = new TokenModel()

  const db = fastify.db

  fastify.post('/login', {
    schema: loginSchema,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body: any = request.body
    const { username, password } = body

    try {
      const data: any = await loginModel.login(db, username)
      if (data) {

        //verify
        const match = await fastify.verifyPassword(password, data.password)
        if (match) {
          const payload: any = {
            sub: data.id,
            ingress_zone: data.ingress_zone,
            hospcode: data.hospcode,
            hospname: data.hospname
          }
          const access_token = await reply.loginJwtSign(payload)
          // update last login
          await loginModel.updateLastLogin(db, username);

          reply
            .status(StatusCodes.OK)
            .send({ access_token })
        } else {
          reply
            .status(StatusCodes.UNAUTHORIZED)
            .send({
              code: StatusCodes.UNAUTHORIZED,
              error: getReasonPhrase(StatusCodes.UNAUTHORIZED),
              message: 'Password not match'
            })
        }

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
        })
    }
  })

  fastify.post('/request', {
    schema: loginSchema,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body: any = request.body
    const { username, password } = body

    try {
      const data: any = await loginModel.login(db, username)
      if (data) {

        //verify
        const match = await fastify.verifyPassword(password, data.password)
        if (match) {
          const payload: any = {
            sub: data.id,
            ingress_zone: data.ingress_zone,
            hospcode: data.hospcode
          }

          const access_token = await reply.sendJwtSign(payload)
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
              error: getReasonPhrase(StatusCodes.UNAUTHORIZED),
              message: 'Password not match'
            })
        }

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
        })
    }
  })

  fastify.post('/genpass', {
    schema: genpassSchema
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body: any = request.body
      const { password } = body
      const hash: any = await fastify.hashPassword(password)
      reply.status(StatusCodes.OK).send({ password, hash })
    } catch (e) {
      console.error(e)
      reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send()
    }
  })

  done()

} 
