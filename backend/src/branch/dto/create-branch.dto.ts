import {
  IsNotEmpty, IsString, IsOptional, IsNumber, IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBranchDto {
  @IsUUID()
  gym_id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional() @IsString()  address?: string;

  @IsOptional() @IsString()  phone?: string;

  @IsOptional() @IsString()  manager_name?: string;

  @IsOptional() @IsString()  opening_time?: string;

  @IsOptional() @IsString()  closing_time?: string;

  @IsOptional() @IsString()  lunch_start?: string;

  @IsOptional() @IsString()  lunch_end?: string;

  @IsOptional() @Type(() => Number) @IsNumber()  monthly_rate?: number;

  @IsOptional() @Type(() => Number) @IsNumber()  quarterly_rate?: number;

  @IsOptional() @Type(() => Number) @IsNumber()  daily_rate?: number;
}
