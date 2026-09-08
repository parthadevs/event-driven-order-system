import { Module } from '@nestjs/common';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ConfigModule } from '@app/config';
import { InventoryHealthController } from './health/health.controller';

@Module({
  imports: [ConfigModule, InventoryModule],
  controllers: [InventoryHealthController],
  providers: [],
})
export class InventoryServiceModule {}
