import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class PageDto {
  @ApiProperty()
  @IsNotEmpty({ message: "必须传入当前分页" })
  @IsNumber({}, { message: "分页数量必须是数字类型" })
  page: number;

  @ApiProperty()
  @IsNotEmpty({ message: "必须传入当前分页条数" })
  @IsNumber({}, { message: "数量必须是数字类型" })
  pageSize: number;
}

export class PageOptionalDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({}, { message: "分页数量必须是数字类型" })
  page?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber({}, { message: "数量必须是数字类型" })
  pageSize?: number;
}
