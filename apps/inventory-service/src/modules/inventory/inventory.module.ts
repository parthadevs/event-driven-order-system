import { Module } from '@nestjs/common';
import { InventoryController } from './presentation/controllers/inventory.controller';
import { InitializeInventoryUseCase } from './application/use-cases/initialize-inventory.use-case';
import { GetInventoryUseCase } from './application/use-cases/get-inventory.use-case';
import { ReserveInventoryUseCase } from './application/use-cases/reserve-inventory.use-case';
import { ConfirmReservationUseCase } from './application/use-cases/confirm-reservation.use-case';
import { ReleaseReservationUseCase } from './application/use-cases/release-reservation.use-case';
import { AdjustInventoryUseCase } from './application/use-cases/adjust-inventory.use-case';
import { ExpireReservationsUseCase } from './application/use-cases/expire-reservations.use-case';
import { InventoryRepository } from './domain/repositories/inventory.repository';
import { PrismaInventoryRepository } from './infrastructure/persistence/prisma-inventory.repository';
import { PrismaServiced } from '../../infrastructure/persistence/prisma/prisma.service';
// import { ReservationSweeper } from './infrastructure/sweeper/reservation.sweeper';

@Module({
  controllers: [InventoryController],
  providers: [
    PrismaServiced,
    {
      provide: InventoryRepository,
      useClass: PrismaInventoryRepository,
    },
    InitializeInventoryUseCase,
    GetInventoryUseCase,
    ReserveInventoryUseCase,
    ConfirmReservationUseCase,
    ReleaseReservationUseCase,
    AdjustInventoryUseCase,
    ExpireReservationsUseCase,
   // ReservationSweeper,
  ],
  exports: [InventoryRepository],
})
export class InventoryModule {}
