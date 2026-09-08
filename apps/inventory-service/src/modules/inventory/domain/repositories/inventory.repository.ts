import { InventoryEntity } from '../entities/inventory.entity';

export abstract class InventoryRepository {
  abstract findByProductId(productId: string): Promise<InventoryEntity | null>;
  abstract findById(id: string): Promise<InventoryEntity | null>;
  abstract findExpiredReservations(limit?: number): Promise<InventoryEntity[]>;
  abstract save(inventory: InventoryEntity): Promise<InventoryEntity>;
  abstract create(inventory: InventoryEntity): Promise<InventoryEntity>;
}
