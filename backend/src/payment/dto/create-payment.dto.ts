import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePaymentDto {
  @IsNotEmpty() @IsString()
  member_id: string;

  @IsEnum(['Monthly', 'Quarterly', 'Annual'])
  plan: string;

  @Type(() => Number) @IsNumber() @Min(0)
  payment_amount: number;

  @IsEnum(['Cash', 'Card', 'Transfer'])
  payment_method: string;
}
