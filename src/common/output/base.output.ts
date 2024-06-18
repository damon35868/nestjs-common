import { HttpStatus } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";

export class BaseOutput {
  @ApiProperty({ default: HttpStatus.OK })
  code: number;

  @ApiProperty({ default: "请求成功" })
  message: string;
}
