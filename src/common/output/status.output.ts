import { ApiProperty } from "@nestjs/swagger";
import { BaseOutput } from "./base.output";

export class CommonStatusOutput extends BaseOutput {
  @ApiProperty()
  data: boolean;
}
