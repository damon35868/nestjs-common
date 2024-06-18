import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

@Injectable()
export class BaseAuthGuard {
  constructor(private jwtService: JwtService, private reflector: Reflector) {}

  protected async getActivate(context: ExecutionContext, secret: string, cb?: (val: any) => void): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException("缺失TOKEN");

    try {
      const payload = await this.jwtService.verifyAsync(token, { secret });
      cb && cb(payload);

      request["tokenData"] = payload;
    } catch (e) {
      throw new UnauthorizedException("TOKEN已过期或不存在");
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authorization = request.headers.authorization;
    if (!authorization) return;

    const [type, token] = authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : authorization || undefined;
  }
}
