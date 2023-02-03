import S from 'fluent-json-schema'

const schema = S.object()
  .prop('refresh_token', S.string().required())

export default {
  body: schema
}