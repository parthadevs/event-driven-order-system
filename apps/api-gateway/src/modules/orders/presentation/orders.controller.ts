import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { OrdersClient } from '@api-gateway/modules/orders/clients/orders.client';
import { CreateOrderRequestDto } from '@api-gateway/modules/orders/presentation/dto/create-order.request.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersClient: OrdersClient) {}

  @Post()
  async createOrder(@Body() data: CreateOrderRequestDto) {
    const response = await this.ordersClient.createOrder(data);
    return response.data;
  }

  @Get()
  async getOrders() {
    const response = await this.ordersClient.getOrders();
    return response.data;
  }

  @Get(':orderId')
  async getOrderById(@Param('orderId') orderId: string) {
    const response = await this.ordersClient.getOrderById(orderId);
    return response.data;
  }

  @Post(':orderId/cancel')
  async cancelOrder(@Param('orderId') orderId: string) {
    const response = await this.ordersClient.cancelOrder(orderId);
    return response.data;
  }
}
