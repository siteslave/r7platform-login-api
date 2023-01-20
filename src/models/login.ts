
export class LoginModel {

  constructor () { }

  async login(postgrest: any, username: any, password: any) {
    return await postgrest
      .from('users')
      .select('id')
      .eq('username', username)
      .eq('password', password);
  }

}
