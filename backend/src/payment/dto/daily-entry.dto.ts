import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class DailyEntryDto {
  @IsNotEmpty() @IsString()
  branch_id: string;

  @IsEnum(['Cash', 'Card', 'Transfer'])
  payment_method: string;
}
