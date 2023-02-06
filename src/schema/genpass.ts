import S from 'fluent-json-schema'

const schema = S.object()
  .prop('password', S.string().minLength(8).required())

export default {
  body: schema
}