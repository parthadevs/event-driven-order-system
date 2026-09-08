import { Module } from '@nestjs/common';
import { OrdersController } from '@order-service/modules/orders/presentation/controllers/orders.controller';
import { CreateOrderUseCase } from '@order-service/modules/orders/application/use-cases/create-order.use-case';
import { GetOrdersUseCase } from '@order-service/modules/orders/application/use-cases/get-orders.use-case';
import { GetOrderByIdUseCase } from '@order-service/modules/orders/application/use-cases/get-order-by-id.use-case';
import { CancelOrderUseCase } from '@order-service/modules/orders/application/use-cases/cancel-order.use-case';
import { OrderRepository } from '@order-service/modules/orders/domain/repositories/order.repository';
import { PrismaOrderRepository } from '@order-service/modules/orders/infrastructure/persistence/prisma-order.repository';
import { PrismaService } from '@order-service/infrastructure/persistence/prisma/prisma.service';

@Module({
  controllers: [OrdersController],
  providers: [
    PrismaService,
    {
      provide: OrderRepository,
      useClass: PrismaOrderRepository,
    },
    CreateOrderUseCase,
    GetOrdersUseCase,
    GetOrderByIdUseCase,
    CancelOrderUseCase,
  ],
  exports: [OrderRepository, CreateOrderUseCase],
})
export class OrdersModule {}
