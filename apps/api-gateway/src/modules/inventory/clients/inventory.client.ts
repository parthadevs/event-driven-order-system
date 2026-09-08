import { Injectable } from '@nestjs/common';
import { ConfigService } from '@app/config';
import { HttpClientService } from '@api-gateway/infrastructure/http/http-client.service';
import {
  InitializeInventoryRequestDto,
  ReserveInventoryRequestDto,
  ConfirmReleaseReservationRequestDto,
} from '../presentation/dto/inventory.request.dto';

@Injectable()
export class InventoryClient {
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpClient: HttpClientService,
  ) {
    this.baseUrl =
      this.configService.get<string>('INVENTORY_SERVICE_URL') || '';
  }

  async initializeInventory(
    productId: string,
    data: Omit<InitializeInventoryRequestDto, 'productId'>,
  ) {
    return this.httpClient.post(`${this.baseUrl}/${productId}/stock`, data);
  }

  async getInventory(productId: string) {
    return this.httpClient.get(`${this.baseUrl}/${productId}`);
  }

  async reserveInventory(productId: string, data: ReserveInventoryRequestDto) {
    return this.httpClient.post(`${this.baseUrl}/${productId}/reserve`, data);
  }

  async confirmReservation(productId: string, data: { orderId: string }) {
    return this.httpClient.post(`${this.baseUrl}/${productId}/confirm`, data);
  }

  async releaseReservation(productId: string, data: { orderId: string }) {
    return this.httpClient.post(`${this.baseUrl}/${productId}/release`, data);
  }

  async adjustInventory(productId: string, data: { quantity: number }) {
    return this.httpClient.post(`${this.baseUrl}/${productId}/adjust`, data);
  }
}
