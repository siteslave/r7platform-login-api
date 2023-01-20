import fp from 'fastify-plugin'
const { PostgrestClient } = require('@supabase/postgrest-js');

module.exports = fp(async function (fastify: any, opts: any, next: any) {

  try {
    const postgrest = new PostgrestClient(opts.url, {
      headers: {
        Prefer: 'tx=rollback',
        Authorization: 'Bearer ' + opts.key
      },
    });

    fastify.decorate('postgrest', postgrest);
    next();
  } catch (err: any) {
    next(err);
  }

}, { fastify: '4.x', name: 'fastify/postgrest' })