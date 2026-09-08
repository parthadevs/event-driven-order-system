import { Injectable } from '@nestjs/common';
import { ConfigService } from '@app/config';
import { HttpClientService } from '@api-gateway/infrastructure/http/http-client.service';
import { CreateOrderRequestDto } from '@api-gateway/modules/orders/presentation/dto/create-order.request.dto';

@Injectable()
export class OrdersClient {
  private baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpClient: HttpClientService,
  ) {
    this.baseUrl = this.configService.get<string>('ORDERS_SERVICE_URL') || '';
  }

  async createOrder(data: CreateOrderRequestDto) {
    return this.httpClient.post(`${this.baseUrl}`, data);
  }

  async getOrders() {
    return this.httpClient.get(`${this.baseUrl}`);
  }

  async getOrderById(orderId: string) {
    return this.httpClient.get(`${this.baseUrl}/${orderId}`);
  }

  async cancelOrder(orderId: string) {
    return this.httpClient.post(`${this.baseUrl}/${orderId}/cancel`, {});
  }
}
