import { NestFactory } from '@nestjs/core';
import { OrderServiceModule } from './order-service.module';
import { ConfigService } from '@app/config';
async function bootstrap() {
  const app = await NestFactory.create(OrderServiceModule);
  const config = app.get(ConfigService);
  await app.listen(config.get('ORDER_SERVICE_PORT') ?? 3002);
  console.log(`Order service is running on port ${config.get('ORDER_SERVICE_PORT') ?? 3000}`);
}
bootstrap();
