import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { InventoryServiceModule } from './inventory-service.module';
import { ConfigService } from '@app/config';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('InventoryBootstrap');
  const app = await NestFactory.create(InventoryServiceModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  const config = app.get(ConfigService);

  const rmqUrl = (config.get('RABBITMQ_URL') as string) ?? 'amqp://localhost:5672';
  const queue = (config.get('INVENTORY_QUEUE') as string) || 'inventory_queue';

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rmqUrl],
      queue: queue,
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();

  const httpPort = Number(config.get('INVENTORY_SERVICE_PORT')) || 3003;
  await app.listen(httpPort);

  logger.log(`Inventory service HTTP server is running on port ${httpPort}`);
  logger.log(`Inventory service is connected to RabbitMQ`);
}
void bootstrap();