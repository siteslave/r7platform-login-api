export interface ICreateUserPlatform {
  name: string
  user_id: string
  api_key: string
  platform_id: string
}

export interface IUpdateUserPlatform {
  name: string
  api_key: string
}