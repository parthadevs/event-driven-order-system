import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { PaymentServiceModule } from './payment-service.module'; // আপনার মডিউলের নাম অনুযায়ী চেক করে নিবেন
import { ConfigService } from '@app/config';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('PaymentBootstrap');
  const app = await NestFactory.create(PaymentServiceModule);

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
  const queue = (config.get('PAYMENT_QUEUE') as string) || 'payment_queue';

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

  const httpPort = Number(config.get('PAYMENT_SERVICE_PORT')) || 3005;
  await app.listen(httpPort);

  logger.log(`Payment service HTTP server is running on port ${httpPort}`);
  logger.log(`Payment service is connected to RabbitMQ`);
}
void bootstrap();