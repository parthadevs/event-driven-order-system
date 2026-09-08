import { Module } from '@nestjs/common';
import { ConfigModule } from '@app/config';
import { KafkaModule } from '@repo/kafka';
import { ProductModule } from './modules/product/product.module';
import { ProductHealthController } from './health/health.controller';

@Module({
  imports: [ConfigModule, KafkaModule.register(), ProductModule],
  controllers: [ProductHealthController],
  providers: [],
})
export class ProductServiceModule {}
