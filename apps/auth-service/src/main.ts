import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@app/config';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('AuthBootstrap');
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const rmqUrl = (config.get('RABBITMQ_URL') as string) ?? 'amqp://localhost:5672';
  const queue = (config.get('AUTH_QUEUE') as string) || 'auth_queue';

  // RabbitMQ Microservice Setup
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

  const httpPort = Number(config.get('AUTH_SERVICE_PORT')) || 3001;
  await app.listen(httpPort);

  logger.log(`Auth service HTTP server is running on port ${httpPort}`);
  logger.log(`Auth service is connected to RabbitMQ`);
}
bootstrap();