import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger();

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse();
    const status = exception.getStatus ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const res: any = exception.getResponse ? exception?.getResponse() : {};
    const msg = res?.message || exception.message;

    const message = msg ? msg : status >= HttpStatus.INTERNAL_SERVER_ERROR ? "Internal server error" : "Bad request";

    response.status(status);
    response.header("Content-Type", "application/json; charset=utf-8");
    response.send({ code: status, message });

    status !== HttpStatus.UNAUTHORIZED && this.logger.error({ code: status, message });
  }
}
