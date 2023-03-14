import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import { getReasonPhrase, StatusCodes } from "http-status-codes"
import { InfoModel } from "../models/info"

export default async (fastify: FastifyInstance, _options: any, done: any) => {

  const infoModel = new InfoModel();
  const db = fastify.db;

  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {

      const decoded: any = await request.loginJwtVerify();
      const userId: any = decoded.sub;

      if (userId) {
        const info: any = await infoModel.getInfo(db, userId);

        reply.status(StatusCodes.OK)
          .send(info);
      } else {
        reply.status(StatusCodes.UNAUTHORIZED)
          .send({ ok: false, error: getReasonPhrase(StatusCodes.UNAUTHORIZED) });
      }
    } catch (error: any) {
      request.log.error(error)
      reply.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ status: 'error' })
    }
  })

  done()

} 
