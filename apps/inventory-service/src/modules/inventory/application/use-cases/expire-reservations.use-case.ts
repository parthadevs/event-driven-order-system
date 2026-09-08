import { Injectable, Logger } from '@nestjs/common';
import { InventoryRepository } from '../../domain/repositories/inventory.repository';

@Injectable()
export class ExpireReservationsUseCase {
  private readonly logger = new Logger(ExpireReservationsUseCase.name);

  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async execute(batchSize = 50): Promise<{ expired: number }> {
    const candidates =
      await this.inventoryRepository.findExpiredReservations(batchSize);
    if (candidates.length === 0) {
      return { expired: 0 };
    }

    let totalExpired = 0;
    for (const inventory of candidates) {
      const expired = inventory.expireReservations();
      console.log('expired', expired);
      if (expired.length > 0) {
        try {
          await this.inventoryRepository.save(inventory);
          totalExpired += expired.length;
        } catch (err) {
          this.logger.error(
            `Failed to persist expirations for inventory ${inventory.id}: ${(err as Error).message}`,
          );
        }
      }
    }

    this.logger.log(`Expired ${totalExpired} reservations`);
    return { expired: totalExpired };
  }
}
