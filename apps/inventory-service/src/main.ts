import { NestFactory } from '@nestjs/core';
import { InventoryServiceModule } from './inventory-service.module';
import { ConfigService } from '@app/config';

async function bootstrap() {
  const app = await NestFactory.create(InventoryServiceModule);
  const config = app.get(ConfigService);
  await app.listen(config.get('INVENTORY_SERVICE_PORT') || 3003);
  console.log(`Inventory service is running on port ${config.get('INVENTORY_SERVICE_PORT') || 3003}`);
}
bootstrap();
