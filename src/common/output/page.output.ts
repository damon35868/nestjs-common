import { ApiProperty } from "@nestjs/swagger";

export class PageOutput<T> {
  @ApiProperty()
  items: T[];

  @ApiProperty()
  totalCount: number;

  @ApiProperty()
  hasNextPage: boolean;
}
