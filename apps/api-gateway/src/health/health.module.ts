import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@app/config';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  imports: [
    ConfigModule,
    // Client providers are module-scoped in Nest. HealthService needs its own
    // imports instead of relying on the registrations in AppModule.
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>('RABBITMQ_URL') ?? 'amqp://localhost:5672'],
            queue: config.get<string>('AUTH_QUEUE') ?? 'auth_queue',
            queueOptions: { durable: true },
          },
        }),
      },
      {
        name: 'ORDERS_SERVICE',
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>('RABBITMQ_URL') ?? 'amqp://localhost:5672'],
            queue: config.get<string>('ORDER_QUEUE') ?? 'order_queue',
            queueOptions: { durable: true },
          },
        }),
      },
      {
        name: 'INVENTORY_SERVICE',
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>('RABBITMQ_URL') ?? 'amqp://localhost:5672'],
            queue: config.get<string>('INVENTORY_QUEUE') ?? 'inventory_queue',
            queueOptions: { durable: true },
          },
        }),
      },
      {
        name: 'PRODUCT_SERVICE',
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>('RABBITMQ_URL') ?? 'amqp://localhost:5672'],
            queue: config.get<string>('PRODUCT_QUEUE') ?? 'product_queue',
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthModule],
})
export class HealthModule {}
