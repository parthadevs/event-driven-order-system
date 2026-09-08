import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ProductServiceModule } from './product-service.module';
import { ConfigService } from '@app/config';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('ProductBootstrap');
  const app = await NestFactory.create(ProductServiceModule);

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
  const queue = (config.get('PRODUCT_QUEUE') as string) || 'product_queue';

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

  const httpPort = Number(config.get('PRODUCT_SERVICE_PORT')) || 3004;
  await app.listen(httpPort);

  logger.log(`Product service HTTP server is running on port ${httpPort}`);
  logger.log(`Product service is connected to RabbitMQ`);
}
void bootstrap();