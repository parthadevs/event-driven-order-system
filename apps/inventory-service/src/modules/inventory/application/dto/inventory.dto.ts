import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class InitializeInventoryDto {
    @IsString()
    @IsNotEmpty()
    productId: string;

    @IsNumber()
    @Min(0)
    quantity: number;
}

export class ReserveInventoryDto {
    @IsString()
    @IsNotEmpty()
    orderId: string;

    @IsNumber()
    @Min(1)
    quantity: number;
}
