import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { InventoryClient } from '../clients/inventory.client';
import {
  InitializeInventoryRequestDto,
  ReserveInventoryRequestDto,
  ConfirmReleaseReservationRequestDto,
} from './dto/inventory.request.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryClient: InventoryClient) {}

  @Post(':productId/stock')
  async initializeInventory(
    @Param('productId') productId: string,
    @Body() data: Omit<InitializeInventoryRequestDto, 'productId'>,
  ) {
    const response = await this.inventoryClient.initializeInventory(
      productId,
      data,
    );
    return response.data;
  }

  @Get(':productId')
  async getInventory(@Param('productId') productId: string) {
    const response = await this.inventoryClient.getInventory(productId);
    return response.data;
  }

  @Post(':productId/reserve')
  async reserveInventory(
    @Param('productId') productId: string,
    @Body() data: ReserveInventoryRequestDto,
  ) {
    const response = await this.inventoryClient.reserveInventory(
      productId,
      data,
    );
    return response.data;
  }

  @Post(':productId/confirm')
  async confirmReservation(
    @Param('productId') productId: string,
    @Body() data: { orderId: string },
  ) {
    const response = await this.inventoryClient.confirmReservation(
      productId,
      data,
    );
    return response.data;
  }

  @Post(':productId/release')
  async releaseReservation(
    @Param('productId') productId: string,
    @Body() data: { orderId: string },
  ) {
    const response = await this.inventoryClient.releaseReservation(
      productId,
      data,
    );
    return response.data;
  }

  @Post(':productId/adjust')
  async adjustInventory(
    @Param('productId') productId: string,
    @Body() data: { quantity: number },
  ) {
    const response = await this.inventoryClient.adjustInventory(
      productId,
      data,
    );
    return response.data;
  }
}
