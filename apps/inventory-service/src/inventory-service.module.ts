import { Module } from '@nestjs/common';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ConfigModule } from '@app/config';

@Module({
  imports: [ConfigModule, InventoryModule],
  controllers: [],
  providers: [],
})
export class InventoryServiceModule {}
