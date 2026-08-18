import { Module } from '@nestjs/common';
import { OrdersModule } from '@order-service/modules/orders/orders.module';
import { ConfigModule } from '@app/config';

@Module({
  imports: [ConfigModule, OrdersModule],
  controllers: [],
  providers: [],
})
export class OrderServiceModule { }
