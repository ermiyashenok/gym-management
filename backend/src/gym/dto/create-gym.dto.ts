import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGymDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
