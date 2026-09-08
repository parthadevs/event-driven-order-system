import { Module } from '@nestjs/common';
import { AuthController } from './modules/auth/presentation/auth.controller';
import { AuthClient } from './modules/auth/clients/auth.client';
import { OrdersController } from './modules/orders/presentation/orders.controller';
import { OrdersClient } from './modules/orders/clients/orders.client';
import { InventoryController } from './modules/inventory/presentation/inventory.controller';
import { InventoryClient } from './modules/inventory/clients/inventory.client';
import { ProductController } from './modules/products/presentation/controllers/product.controller';
import { ProductClient } from './modules/products/clients/product.client';
import { HttpClientService } from './infrastructure/http/http-client.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@app/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    HttpModule,
    ConfigModule,
    HealthModule,
    // RabbitMQ Clients Registration for Microservices
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL') ?? 'amqp://localhost:5672'],
            queue: configService.get<string>('AUTH_QUEUE') ?? 'auth_queue',
            queueOptions: { durable: true },
          },
        }),
      },
      {
        name: 'ORDERS_SERVICE',
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL') ?? 'amqp://localhost:5672'],
            queue: configService.get<string>('ORDER_QUEUE') ?? 'order_queue',
            queueOptions: { durable: true },
          },
        }),
      },
      {
        name: 'INVENTORY_SERVICE',
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL') ?? 'amqp://localhost:5672'],
            queue: configService.get<string>('INVENTORY_QUEUE') ?? 'inventory_queue',
            queueOptions: { durable: true },
          },
        }),
      },
      {
        name: 'PRODUCT_SERVICE',
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL') ?? 'amqp://localhost:5672'],
            queue: configService.get<string>('PRODUCT_QUEUE') ?? 'product_queue',
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],

  controllers: [AuthController, OrdersController, InventoryController, ProductController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    AuthClient,
    OrdersClient,
    InventoryClient,
    ProductClient,
    HttpClientService,
  ],
})
export class AppModule {}
