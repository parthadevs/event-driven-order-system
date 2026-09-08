import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
