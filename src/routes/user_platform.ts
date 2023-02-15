import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import {
  StatusCodes,
  getReasonPhrase,
} from 'http-status-codes'
import _ from "lodash"
import { ICreateUserPlatform, IUpdateUserPlatform } from "../../@types/model"
import { PlatformModel } from "../models/user_platform"

import createSchema from '../schema/platform/create'
import updateSchema from '../schema/platform/update'


export default async (fastify: FastifyInstance) => {

  const platformModel = new PlatformModel()

  const db = fastify.db

  fastify.get('/', {
    config: {
      rateLimit: {
        max: 50,
        timeWindow: '1 minute'
      }
    },
    onRequest: [fastify.authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user_id = request.user.sub
    try {
      const results: any = await platformModel.list(db, user_id)

      reply
        .status(StatusCodes.OK)
        .send({ status: 'success', results })

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

  fastify.post('/', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute'
      }
    },
    onRequest: [fastify.authenticate],
    schema: createSchema,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body: any = request.body
    const { name, api_key, platform_id } = body

    const user_id = request.user.sub
    const platform: ICreateUserPlatform = {
      api_key, name, platform_id, user_id
    }
    try {
      await platformModel.save(db, platform)

      reply
        .status(StatusCodes.CREATED)
        .send({ status: 'success' })

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

  fastify.put('/:id', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute'
      }
    },
    onRequest: [fastify.authenticate],
    schema: updateSchema,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body: any = request.body
    const params: any = request.params
    const { api_key, name } = body
    const { id } = params

    const platform: IUpdateUserPlatform = {
      api_key, name
    }
    try {
      await platformModel.update(db, id, platform)

      reply
        .status(StatusCodes.OK)
        .send({ status: 'success' })

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

} 
