import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateTrainerStatusDto {
  @IsEnum(['Active', 'On Break', 'Offline'])
  status: 'Active' | 'On Break' | 'Offline';

  @IsOptional() @IsString()
  unavailable_until?: string; // ISO date string e.g. "2026-07-23"

  @IsOptional() @IsString()
  unavailable_duration?: string; // e.g. "1 Week"
}
