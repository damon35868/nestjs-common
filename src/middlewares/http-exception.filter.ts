import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private log: boolean = true) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse();
    const status = exception.getStatus || exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const res: any = exception.getResponse ? exception?.getResponse() : {};
    const msg = res?.message || exception?.message;

    const message = msg ? msg : status >= HttpStatus.INTERNAL_SERVER_ERROR ? "服务器错误 Internal server error" : "客户端错误 Bad request";

    response.status(status);
    response.header("Content-Type", "application/json; charset=utf-8");
    response.send({ code: status, message });

    if (this.log) {
      status !== HttpStatus.UNAUTHORIZED && Logger.error({ code: status, message });
    }
  }
}
