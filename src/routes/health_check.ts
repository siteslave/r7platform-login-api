import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import { StatusCodes } from "http-status-codes"

export default async (fastify: FastifyInstance, _options: any, done: any) => {

  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      reply.status(StatusCodes.OK)
        .send({
          status: 'ok',
          version: '1.0.1',
          name: process.env.R7PLATFORM_LOGIN_HOSTNAME || 'default-server'
        })
    } catch (error: any) {
      request.log.error(error)
      reply.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ status: 'error' })
    }
  })

  done()

} 
