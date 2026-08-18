import { InventoryEntity } from '../entities/inventory.entity';

export abstract class InventoryRepository {
    abstract findByProductId(productId: string): Promise<InventoryEntity | null>;
    abstract save(inventory: InventoryEntity): Promise<InventoryEntity>;
}
