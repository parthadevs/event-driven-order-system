import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailRequestDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
