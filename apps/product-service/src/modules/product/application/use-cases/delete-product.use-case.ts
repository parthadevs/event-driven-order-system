import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { ProductEntity } from '../../domain/entities/product.entity';

@Injectable()
export class DeleteProductUseCase {
  private readonly logger = new Logger(DeleteProductUseCase.name);

  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: string): Promise<ProductEntity> {
    this.logger.log(`Soft-deleting product id=${id}`);
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    product.deactivate();
    return this.productRepository.save(product);
  }
}
