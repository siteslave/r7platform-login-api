import S from 'fluent-json-schema'

const schema = S.object()
  .prop('Authorization', S.string().required())

export default {
  headers: schema
}