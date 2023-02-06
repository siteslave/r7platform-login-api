import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import { StatusCodes } from "http-status-codes"

export default async (fastify: FastifyInstance, _options: any, done: any) => {

  fastify.get('/health-check', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      reply.status(StatusCodes.OK)
        .send({ status: 'success' })
    } catch (error: any) {
      request.log.error(error)
      reply.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ status: 'error' })
    }
  })

  done()

} 
