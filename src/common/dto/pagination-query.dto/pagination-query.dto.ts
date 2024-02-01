import { Type } from 'class-transformer';
import { IsOptional, IsPositive } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @IsPositive()
  //   @Type(() => Number) <- since we enable the enableImplicitConversion on the main.ts
  limit: number;

  @IsOptional()
  @IsPositive()
  offset: number;
}
