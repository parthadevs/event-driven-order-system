import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InventoryRepository } from '../../domain/repositories/inventory.repository';
import { ReserveInventoryDto } from '../dto/inventory.dto';
import { InventoryEntity } from '../../domain/entities/inventory.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ReserveInventoryUseCase {
  private readonly logger = new Logger(ReserveInventoryUseCase.name);

  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async execute(
    productId: string,
    dto: ReserveInventoryDto,
  ): Promise<InventoryEntity> {
    this.logger.log(
      `Reserving ${dto.quantity} items of product ${productId} for order ${dto.orderId}`,
    );
    const inventory = await this.inventoryRepository.findByProductId(productId);

    if (!inventory) {
      throw new NotFoundException(
        `Inventory for product ${productId} not found`,
      );
    }

    inventory.reserve(dto.quantity, dto.orderId, uuidv4());
    return this.inventoryRepository.save(inventory);
  }
}
