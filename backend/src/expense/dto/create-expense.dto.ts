import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExpenseDto {
  @IsNotEmpty() @IsString()
  branch_id: string;

  @IsNotEmpty() @IsString()
  type: string;

  @IsOptional() @IsString()
  reason?: string;

  @Type(() => Number) @IsNumber() @Min(0)
  amount: number;
}
