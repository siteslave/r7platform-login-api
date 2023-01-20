
export class LoginModel {

  constructor () { }

  login(postgrest: any, username: any, password: any) {
    return postgrest
      .from('users')
      .select('id')
      .eq('username', username)
      .eq('password', password)
      .limit(1);
  }

}
