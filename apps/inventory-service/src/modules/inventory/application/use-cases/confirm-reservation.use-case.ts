import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InventoryRepository } from '../../domain/repositories/inventory.repository';
import { InventoryEntity } from '../../domain/entities/inventory.entity';

@Injectable()
export class ConfirmReservationUseCase {
  private readonly logger = new Logger(ConfirmReservationUseCase.name);

  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async execute(productId: string, orderId: string): Promise<InventoryEntity> {
    this.logger.log(
      `Confirming reservation for product ${productId}, order ${orderId}`,
    );
    const inventory = await this.inventoryRepository.findByProductId(productId);

    if (!inventory) {
      throw new NotFoundException(
        `Inventory for product ${productId} not found`,
      );
    }

    inventory.confirmReservation(orderId);
    return this.inventoryRepository.save(inventory);
  }
}
