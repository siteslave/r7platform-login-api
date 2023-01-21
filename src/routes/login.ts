import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  StatusCodes,
  getReasonPhrase,
} from 'http-status-codes';

import _ from 'lodash';
import crypto from 'crypto'

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
    const body: any = request.body;
    const username = body.username;
    const password = body.password;

    try {
      const encPassword = crypto.createHash('md5').update(password).digest('hex');

      const { data, error } = await loginModel.login(postgrest, username, encPassword);

      if (error) {
        request.log.error(error);
        reply
          .status(StatusCodes.BAD_GATEWAY)
          .send(getReasonPhrase(StatusCodes.BAD_GATEWAY))
      } else {

        if (_.isEmpty(data)) {
          reply
            .status(StatusCodes.BAD_REQUEST)
            .send({
              code: StatusCodes.BAD_REQUEST,
              error: "Invalid username or password"
            });
        } else {
          const payload: any = { sub: data.id }
          const token = fastify.jwt.sign(payload);
          reply
            .status(StatusCodes.OK)
            .send({ access_token: token });
        }

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

} 
