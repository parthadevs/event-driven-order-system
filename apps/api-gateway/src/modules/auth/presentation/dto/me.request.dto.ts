import { IsNotEmpty, IsString } from 'class-validator';

export class MeRequestDto {
    @IsString()
    @IsNotEmpty()
    token: string;
}
