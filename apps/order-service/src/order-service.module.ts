import { Module } from '@nestjs/common';
import { OrdersModule } from '@order-service/modules/orders/orders.module';

@Module({
  imports: [OrdersModule],
  controllers: [],
  providers: [],
})
export class OrderServiceModule { }
