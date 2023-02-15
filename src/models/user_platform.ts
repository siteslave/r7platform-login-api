import { Knex } from 'knex'
import { ICreateUserPlatform, IUpdateUserPlatform } from '../../@types/model'
export class PlatformModel {

  constructor () { }

  list(db: Knex, userId: any) {
    return db('user_platforms as u')
      .select('u.*', 'p.platform_name', 'p.id as platform_id')
      .innerJoin('platforms as p', 'p.id', 'u.platform_id')
      .where({ 'u.user_id': userId })
  }

  save(db: Knex, data: ICreateUserPlatform) {
    return db('user_platforms')
      .insert({
        user_id: data.user_id,
        name: data.name,
        api_key: data.api_key,
        platform_id: data.platform_id,
        created_at: db.raw('CURRENT_TIMESTAMP')
      })
  }

  update(db: Knex, id: any, data: IUpdateUserPlatform) {
    return db('user_platforms')
      .where('id', id)
      .update({
        api_key: data.api_key,
        name: data.name,
        updated_at: db.raw('CURRENT_TIMESTAMP')
      })
  }

  remove(db: Knex, id: any) {
    return db('user_platforms')
      .where('id', id)
      .del()
  }

}
