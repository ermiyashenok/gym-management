import {
  IsDateString, IsEnum, IsOptional, IsString, IsUUID,
} from 'class-validator';

export class UpdateMemberDto {
  @IsOptional() @IsString()  first_name?: string;
  @IsOptional() @IsString()  last_name?:  string;
  @IsOptional() @IsString()  phone?:      string;
  @IsOptional() @IsString()  email?:      string;
  @IsOptional() @IsDateString() dob?:     string;

  @IsOptional()
  @IsEnum(['Male', 'Female', 'Other'])
  gender?: string;

  @IsOptional()
  @IsEnum(['Monthly', 'Quarterly', 'Annual'])
  plan?: string;

  @IsOptional() @IsUUID()  trainer_id?: string;
  @IsOptional() @IsString() notes?:     string;
}
