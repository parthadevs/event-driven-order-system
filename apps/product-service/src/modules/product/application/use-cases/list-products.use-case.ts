import { Injectable } from '@nestjs/common';
import {
  ProductRepository,
  ProductListFilter,
} from '../../domain/repositories/product.repository';
import { ProductEntity } from '../../domain/entities/product.entity';

export interface ProductListResult {
  items: ProductEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ListProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(filter: ProductListFilter): Promise<ProductListResult> {
    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.min(100, Math.max(1, filter.limit ?? 20));
    const result = await this.productRepository.list({
      ...filter,
      page,
      limit,
    });
    return {
      ...result,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(result.total / limit)),
    };
  }
}
