import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class InitializeInventoryRequestDto {
    @IsString()
    @IsNotEmpty()
    productId: string;

    @IsNumber()
    @Min(0)
    quantity: number;
}

export class ReserveInventoryRequestDto {
    @IsString()
    @IsNotEmpty()
    orderId: string;

    @IsNumber()
    @Min(1)
    quantity: number;
}

export class ConfirmReleaseReservationRequestDto {
    @IsString()
    @IsNotEmpty()
    productId: string;
}
