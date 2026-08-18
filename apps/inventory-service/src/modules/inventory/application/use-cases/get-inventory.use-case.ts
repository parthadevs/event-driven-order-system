import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InventoryRepository } from '../../domain/repositories/inventory.repository';
import { InventoryEntity } from '../../domain/entities/inventory.entity';

@Injectable()
export class GetInventoryUseCase {
    private readonly logger = new Logger(GetInventoryUseCase.name);

    constructor(private readonly inventoryRepository: InventoryRepository) {}

    async execute(productId: string): Promise<InventoryEntity> {
        this.logger.log(`Fetching inventory for product: ${productId}`);
        const inventory = await this.inventoryRepository.findByProductId(productId);
        if (!inventory) {
            throw new NotFoundException(`Inventory for product ${productId} not found`);
        }
        return inventory;
    }
}
