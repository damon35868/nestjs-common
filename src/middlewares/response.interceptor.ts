import { Response } from "express";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Injectable, NestInterceptor, CallHandler, ExecutionContext, HttpStatus } from "@nestjs/common";

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const res: Response = context.switchToHttp().getResponse();
    res.statusCode = res.statusCode === HttpStatus.CREATED ? HttpStatus.OK : res.statusCode;
    return next.handle().pipe(map((data: any) => ({ code: res.statusCode, message: "请求成功", data })));
  }
}
