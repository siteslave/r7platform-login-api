import { Knex } from 'knex'
export class TokenModel {

  constructor () { }

  saveToken(db: Knex, data: any, refreshToken: any) {
    return db('tokens')
      .insert({
        user_id: data.id,
        ingress_zone: data.ingress_zone,
        hospcode: data.hospcode,
        refresh_token: refreshToken,
        expires_at: db.raw('CURRENT_TIMESTAMP + INTERVAL \'30 days\'')
      })
  }

  verifyToken(db: Knex, refreshToken: any) {
    return db('tokens')
      .select()
      .where('refresh_token', refreshToken)
      .whereRaw('expires_at > CURRENT_TIMESTAMP')
      .first()
  }

}
