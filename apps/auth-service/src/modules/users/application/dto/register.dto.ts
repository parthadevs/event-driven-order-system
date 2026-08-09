import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class RegisterDto {

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    @IsString()
    @IsNotEmpty()
    password: string;

}