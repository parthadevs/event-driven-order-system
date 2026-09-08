import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { OrderServiceModule } from './order-service.module';
import { ConfigService } from '@app/config';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('OrderBootstrap');
  const app = await NestFactory.create(OrderServiceModule);

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
  const queue = (config.get('ORDER_QUEUE') as string) || 'order_queue';

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

  const httpPort = Number(config.get('ORDER_SERVICE_PORT')) || 3002;
  await app.listen(httpPort);

  logger.log(`Order service HTTP server is running on port ${httpPort}`);
  logger.log(`Order service is connected to RabbitMQ`);
}
void bootstrap();