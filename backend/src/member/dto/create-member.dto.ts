import {
  IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMemberDto {
  @IsString()
  branch_id: string;

  @IsOptional() @IsString()
  trainer_id?: string;

  @IsNotEmpty() @IsString()  first_name: string;
  @IsNotEmpty() @IsString()  last_name:  string;

  @IsOptional() @IsString()  phone?: string;
  @IsOptional() @IsString()  email?: string;
  @IsOptional() @IsDateString() dob?: string;

  @IsOptional()
  @IsEnum(['Male', 'Female', 'Other'])
  gender?: string;

  @IsEnum(['Monthly', 'Quarterly', 'Annual'])
  plan: string;

  @IsDateString()
  start_date: string;

  @IsOptional() @IsString()  notes?: string;

  @Type(() => Number) @IsNumber() @Min(0)
  payment_amount: number;

  @IsEnum(['Cash', 'Card', 'Transfer'])
  payment_method: string;
}
