import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { InventoryRepository } from '../../domain/repositories/inventory.repository';
import { InitializeInventoryDto } from '../dto/inventory.dto';
import { InventoryEntity } from '../../domain/entities/inventory.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InitializeInventoryUseCase {
  private readonly logger = new Logger(InitializeInventoryUseCase.name);

  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async execute(dto: InitializeInventoryDto): Promise<InventoryEntity> {
    this.logger.log(`Initializing inventory for product: ${dto.productId}`);

    const existing = await this.inventoryRepository.findByProductId(
      dto.productId,
    );
    if (existing) {
      throw new ConflictException(
        `Inventory for product ${dto.productId} already exists`,
      );
    }

    const now = new Date();
    const inventory = new InventoryEntity(
      uuidv4(),
      dto.productId,
      dto.quantity,
      0,
      now,
      now,
      [],
      0,
    );
    return this.inventoryRepository.create(inventory);
  }
}
