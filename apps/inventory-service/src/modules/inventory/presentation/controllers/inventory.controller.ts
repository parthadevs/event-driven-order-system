import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { InitializeInventoryUseCase } from '../../application/use-cases/initialize-inventory.use-case';
import { GetInventoryUseCase } from '../../application/use-cases/get-inventory.use-case';
import { ReserveInventoryUseCase } from '../../application/use-cases/reserve-inventory.use-case';
import { ConfirmReservationUseCase } from '../../application/use-cases/confirm-reservation.use-case';
import { ReleaseReservationUseCase } from '../../application/use-cases/release-reservation.use-case';
import { AdjustInventoryUseCase } from '../../application/use-cases/adjust-inventory.use-case';
import {
  AdjustInventoryDto,
  InitializeInventoryDto,
  OrderIdDto,
  ReserveInventoryDto,
} from '../../application/dto/inventory.dto';

@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly initializeInventoryUseCase: InitializeInventoryUseCase,
    private readonly getInventoryUseCase: GetInventoryUseCase,
    private readonly reserveInventoryUseCase: ReserveInventoryUseCase,
    private readonly confirmReservationUseCase: ConfirmReservationUseCase,
    private readonly releaseReservationUseCase: ReleaseReservationUseCase,
    private readonly adjustInventoryUseCase: AdjustInventoryUseCase,
  ) {}

  @Post(':productId/stock')
  async initializeInventory(
    @Param('productId') productId: string,
    @Body() dto: Omit<InitializeInventoryDto, 'productId'>,
  ) {
    return this.initializeInventoryUseCase.execute({ ...dto, productId });
  }

  @Get(':productId')
  async getInventory(@Param('productId') productId: string) {
    return this.getInventoryUseCase.execute(productId);
  }

  @Post(':productId/reserve')
  async reserveInventory(
    @Param('productId') productId: string,
    @Body() dto: ReserveInventoryDto,
  ) {
    return this.reserveInventoryUseCase.execute(productId, dto);
  }

  @Post(':productId/confirm')
  async confirmReservation(
    @Param('productId') productId: string,
    @Body() body: OrderIdDto,
  ) {
    return this.confirmReservationUseCase.execute(productId, body.orderId);
  }

  @Post(':productId/release')
  async releaseReservation(
    @Param('productId') productId: string,
    @Body() body: OrderIdDto,
  ) {
    return this.releaseReservationUseCase.execute(productId, body.orderId);
  }

  @Post(':productId/adjust')
  async adjustInventory(
    @Param('productId') productId: string,
    @Body() body: AdjustInventoryDto,
  ) {
    return this.adjustInventoryUseCase.execute(productId, body.quantity);
  }
}
