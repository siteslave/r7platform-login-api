
export class LoginModel {

  constructor () { }

  async login(postgrest: any, username: any) {
    return await postgrest
      .from('users')
      .select('id,password,ingress_zone')
      .eq('username', username)
      .eq('enabled', true)
      .single();
  }

}
