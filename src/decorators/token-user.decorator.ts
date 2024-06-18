import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const UserId = createParamDecorator((data: string, ctx: ExecutionContext): number => {
  const request = ctx.switchToHttp().getRequest()
  const { userId } = request.tokenData || {}

  return userId || 0
})
