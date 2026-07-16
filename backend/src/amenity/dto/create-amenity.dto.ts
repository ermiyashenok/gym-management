import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAmenityDto {
  @IsNotEmpty() @IsString()
  branch_id: string;

  @IsNotEmpty() @IsString()
  name: string;

  @IsOptional() @IsString()
  category?: string;

  @Type(() => Number) @IsNumber() @Min(0)
  price: number;

  @Type(() => Number) @IsNumber() @Min(0)
  stock: number;

  @IsOptional() @IsString()
  image_url?: string;
}
