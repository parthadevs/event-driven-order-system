import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NotificationServiceModule } from './notification-service.module'; // আপনার মডিউলের নাম অনুযায়ী চেক করে নিবেন
import { ConfigService } from '@app/config';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('NotificationBootstrap');
  const app = await NestFactory.create(NotificationServiceModule);

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
  const queue = (config.get('NOTIFICATION_QUEUE') as string) || 'notification_queue';

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

  const httpPort = Number(config.get('NOTIFICATION_SERVICE_PORT')) || 3006;
  await app.listen(httpPort);

  logger.log(`Notification service HTTP server is running on port ${httpPort}`);
  logger.log(`Notification service is connected to RabbitMQ`);
}
void bootstrap();