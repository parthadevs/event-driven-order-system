import { ProductEntity } from '../entities/product.entity';

export interface ProductListFilter {
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export abstract class ProductRepository {
  abstract create(product: ProductEntity): Promise<ProductEntity>;
  abstract findById(id: string): Promise<ProductEntity | null>;
  abstract findBySku(sku: string): Promise<ProductEntity | null>;
  abstract save(product: ProductEntity): Promise<ProductEntity>;
  abstract list(
    filter: ProductListFilter,
  ): Promise<{ items: ProductEntity[]; total: number }>;
}
