import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { ProductEntity } from '../../domain/entities/product.entity';
import { UpdateProductDto } from '../dto/product.dto';

@Injectable()
export class UpdateProductUseCase {
  private readonly logger = new Logger(UpdateProductUseCase.name);

  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: string, dto: UpdateProductDto): Promise<ProductEntity> {
    this.logger.log(`Updating product id=${id}`);

    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }

    product.update(dto);
    return this.productRepository.save(product);
  }
}
