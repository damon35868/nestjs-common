import { ApiProperty } from "@nestjs/swagger";
import { CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from "typeorm";

export class BaseEntity {
  @DeleteDateColumn({ nullable: true, select: false })
  deletedAt: Date | null;

  @ApiProperty({ description: "创建时间" })
  @CreateDateColumn({ comment: "创建时间" })
  createdAt: Date;

  @ApiProperty({ description: "更新时间" })
  @UpdateDateColumn({ comment: "更新时间" })
  updatedAt: Date;
}

export class BaseDateEntity {
  @ApiProperty({ description: "创建时间" })
  @CreateDateColumn({ comment: "创建时间" })
  createdAt: Date;

  @ApiProperty({ description: "更新时间" })
  @UpdateDateColumn({ comment: "更新时间" })
  updatedAt: Date;
}
