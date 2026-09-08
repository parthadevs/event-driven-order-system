import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InventoryRepository } from '../../domain/repositories/inventory.repository';
import { InventoryEntity } from '../../domain/entities/inventory.entity';

@Injectable()
export class AdjustInventoryUseCase {
  private readonly logger = new Logger(AdjustInventoryUseCase.name);

  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async execute(
    productId: string,
    targetQuantity: number,
  ): Promise<InventoryEntity> {
    this.logger.log(
      `Adjusting inventory for product ${productId} to quantity ${targetQuantity}`,
    );

    const inventory = await this.inventoryRepository.findByProductId(productId);
    if (!inventory) {
      throw new NotFoundException(
        `Inventory for product ${productId} not found`,
      );
    }

    inventory.adjust(targetQuantity);
    return this.inventoryRepository.save(inventory);
  }
}
