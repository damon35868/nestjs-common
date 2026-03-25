import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Response } from "express";
import { BusinessException } from "../common/business-exception";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter<Error> {
  constructor(
    private log: boolean = true,
    private readonly exceptionMessages: Record<number | string, string> = {}
  ) {}

  catch(exception: HttpException | BusinessException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse();

    let message = "未知错误";
    let code = HttpStatus.INTERNAL_SERVER_ERROR;
    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof BusinessException) {
      code = exception.code;
      httpStatus = exception?.httpStatus ? exception.httpStatus : HttpStatus.OK;
      message = exception?.message ? exception.message : this.exceptionMessages[code] || "业务异常 Business exception";
    } else if (exception instanceof HttpException) {
      const res: any = exception?.getResponse ? exception?.getResponse() : {};
      const msg = res?.message || exception?.message;
      message = msg ? msg : httpStatus >= HttpStatus.INTERNAL_SERVER_ERROR ? "服务器错误 Internal server error" : "客户端错误 Bad request";
      httpStatus = code = exception.getStatus();
    }

    response.status(httpStatus);
    response.header("Content-Type", "application/json; charset=utf-8");
    response.send({ code, message });

    if (this.log) {
      httpStatus !== HttpStatus.UNAUTHORIZED &&
        Logger.error({
          type: exception instanceof BusinessException ? "Business" : "HTTP",
          code,
          httpStatus,
          message,
          stack: exception?.stack
        });
    }
  }
}
