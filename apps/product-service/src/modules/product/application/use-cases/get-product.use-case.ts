import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { ProductEntity } from '../../domain/entities/product.entity';

@Injectable()
export class GetProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: string): Promise<ProductEntity> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return product;
  }
}

@Injectable()
export class GetProductBySkuUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(sku: string): Promise<ProductEntity> {
    const product = await this.productRepository.findBySku(sku);
    if (!product) {
      throw new NotFoundException(`Product with SKU ${sku} not found`);
    }
    return product;
  }
}
