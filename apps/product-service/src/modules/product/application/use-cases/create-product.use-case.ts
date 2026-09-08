import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { ProductEntity } from '../../domain/entities/product.entity';
import { CreateProductDto } from '../dto/product.dto';
import { newId } from '../../domain/utils/id.util';
import { SagaOrchestrator } from '../../saga/saga.orchestrator';

@Injectable()
export class CreateProductUseCase {
  private readonly logger = new Logger(CreateProductUseCase.name);

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly sagaOrchestrator: SagaOrchestrator,
  ) {}

  async execute(dto: CreateProductDto): Promise<ProductEntity> {
    this.logger.log(`Creating product sku=${dto.sku}`);

    const existing = await this.productRepository.findBySku(dto.sku);
    this.logger.log("existing")
    if (existing) {
      throw new ConflictException(
        `Product with SKU '${dto.sku}' already exists`,
      );
    }

    const now = new Date();
    const product = new ProductEntity(
      newId(),
      dto.sku.trim(),
      dto.name.trim(),
      dto.description?.trim() ?? null,
      dto.price,
      (dto.currency ?? 'USD').toUpperCase(),
      true,
      now,
      now,
      0,
    );

    const created = await this.productRepository.create(product);

    const initialQuantity = dto.initialQuantity ?? 0;
    // Fire-and-forget the saga; failures do not block product creation
    // since the product is already persisted. Compensation follows below.
    void this.sagaOrchestrator
      .startProductCreate({
        productId: created.id,
        sku: created.sku,
        initialQuantity,
      })
      .catch((err) => {
        this.logger.error(
          `Saga product-create failed for productId=${created.id}: ${(err as Error).message}`,
        );
      });

    return created;
  }
}
