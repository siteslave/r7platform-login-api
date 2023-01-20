
export class LoginModel {

  constructor () { }

  login(postgrest: any, username: any, password: any) {
    return postgrest.post()
  }

}
