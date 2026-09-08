import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateProductRequestDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  sku!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsString()
  @IsIn(['USD', 'EUR', 'GBP', 'BDT'])
  currency?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  initialQuantity?: number;
}

export class UpdateProductRequestDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  @IsIn(['USD', 'EUR', 'GBP', 'BDT'])
  currency?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ListProductsQueryDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}