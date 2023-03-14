import { Knex } from 'knex'
export class InfoModel {

  getInfo(db: Knex, userId: any) {
    return db('users as u')
      .select('u.id', 'u.first_name', 'u.last_name', 'u.last_login',
        'h.hospcode', 'h.hospname', 'z.name as zone_name')
      .innerJoin('hospitals as h', 'h.hospcode', 'u.hospcode')
      .innerJoin('zones as z', 'z.code', 'h.zone_code')
      .where('u.id', userId)
      .first()
  }

}
