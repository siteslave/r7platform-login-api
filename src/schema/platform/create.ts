import S from 'fluent-json-schema'

const schema = S.object()
  .prop('name', S.string().maxLength(250).required())
  .prop('api_key', S.string().maxLength(250))
  .prop('platform_id', S.string().maxLength(250).required())

export default {
  body: schema
}