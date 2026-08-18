import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CreateOrderUseCase } from '@order-service/modules/orders/application/use-cases/create-order.use-case';
import { GetOrdersUseCase } from '@order-service/modules/orders/application/use-cases/get-orders.use-case';
import { GetOrderByIdUseCase } from '@order-service/modules/orders/application/use-cases/get-order-by-id.use-case';
import { CancelOrderUseCase } from '@order-service/modules/orders/application/use-cases/cancel-order.use-case';
import { CreateOrderDto } from '@order-service/modules/orders/application/dto/create-order.dto';

@Controller()
export class OrdersController {
    constructor(
        private readonly createOrderUseCase: CreateOrderUseCase,
        private readonly getOrdersUseCase: GetOrdersUseCase,
        private readonly getOrderByIdUseCase: GetOrderByIdUseCase,
        private readonly cancelOrderUseCase: CancelOrderUseCase
    ) { }

    @Post()
    async createOrder(@Body() createOrderDto: CreateOrderDto) {
        return this.createOrderUseCase.execute(createOrderDto);
    }

    @Get()
    async getOrders() {
        return this.getOrdersUseCase.execute();
    }

    @Get(':orderId')
    async getOrderById(@Param('orderId') orderId: string) {
        return this.getOrderByIdUseCase.execute(orderId);
    }

    @Post(':orderId/cancel')
    async cancelOrder(@Param('orderId') orderId: string) {
        return this.cancelOrderUseCase.execute(orderId);
    }
}
