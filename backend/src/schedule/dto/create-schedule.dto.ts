import { IsEnum, IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateScheduleDto {
  @IsNotEmpty() @IsString()
  trainer_id: string;

  @Type(() => Number) @IsInt() @Min(0) @Max(6)
  day: number;

  @IsNotEmpty() @IsString()
  time: string;

  @IsNotEmpty() @IsString()
  member_id: string;
}
