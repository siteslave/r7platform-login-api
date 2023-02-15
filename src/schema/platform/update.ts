import S from 'fluent-json-schema'

const bodySchema = S.object()
  .prop('api_key', S.string().maxLength(250))
  .prop('name', S.string().maxLength(250).required())

const paramsSchema = S.object()
  .prop('id', S.string().required())

export default {
  body: bodySchema,
  params: paramsSchema
}