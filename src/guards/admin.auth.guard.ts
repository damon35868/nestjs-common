import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { BaseAuthGuard } from './base.auth.guard'

@Injectable()
export class AdminAuthGuard extends BaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    return this.getActivate(context, process.env.JWT_ADMIN_SRCRET)
  }
}
