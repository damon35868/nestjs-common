import { applyDecorators, HttpStatus, Type } from '@nestjs/common'
import { ApiOkResponse, getSchemaPath } from '@nestjs/swagger'

export const ApiPageResponse = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        properties: {
          code: { type: 'number', default: HttpStatus.OK },
          message: { type: 'string', default: '请求成功' },
          data: {
            properties: {
              items: {
                type: 'array',
                items: { $ref: getSchemaPath(model) }
              },
              totalCount: {
                type: 'number'
              },
              hasNextPage: {
                type: 'boolean'
              }
            }
          }
        }
      }
    })
  )
}
