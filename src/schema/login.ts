import S from 'fluent-json-schema'

const loginSchema = S.object()
  .prop('username', S.string().minLength(4).required())
  .prop('password', S.string().minLength(8).required())

export default {
  body: loginSchema
}