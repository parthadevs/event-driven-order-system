import { Module } from '@nestjs/common';
import { OrdersModule } from '@order-service/modules/orders/orders.module';
import { ConfigModule } from '@app/config';
import { OrderHealthController } from './health/health.controller';


@Module({
  imports: [ConfigModule, OrdersModule],
  controllers: [OrderHealthController],
  providers: [],
})
export class OrderServiceModule {}
