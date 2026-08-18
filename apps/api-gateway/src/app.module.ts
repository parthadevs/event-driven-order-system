import { Module } from '@nestjs/common';
import { AuthController } from './modules/auth/presentation/auth.controller';
import { AuthClient } from './modules/auth/clients/auth.client';
import { OrdersController } from './modules/orders/presentation/orders.controller';
import { OrdersClient } from './modules/orders/clients/orders.client';
import { InventoryController } from './modules/inventory/presentation/inventory.controller';
import { InventoryClient } from './modules/inventory/clients/inventory.client';
import { HttpClientService } from './infrastructure/http/http-client.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@app/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
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
        limit: 20
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100
      },
    ]),
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
    })],

  controllers: [AuthController, OrdersController, InventoryController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    AuthClient,
    OrdersClient,
    InventoryClient,
    HttpClientService,
    ConfigService

  ],
})
export class AppModule { }
