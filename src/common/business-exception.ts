import { IntrinsicException } from "@nestjs/common";

/**
 * 业务异常类
 */
export class BusinessException extends IntrinsicException {
  constructor(
    public readonly code: number,
    public readonly message: string = "",
    public readonly httpStatus?: number
  ) {
    super(message);
    this.name = "BusinessException";
  }
}
