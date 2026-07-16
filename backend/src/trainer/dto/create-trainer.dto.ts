import {
  IsEmail, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTrainerDto {
  @IsUUID()
  branch_id: string;

  @IsNotEmpty() @IsString()  first_name: string;

  @IsNotEmpty() @IsString()  last_name: string;

  @IsOptional() @IsString()  phone?: string;

  @IsOptional() @IsEmail()   email?: string;

  @IsOptional() @IsString()  specialization?: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  experience_yrs?: number;

  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  stipend_per_member?: number;
}
