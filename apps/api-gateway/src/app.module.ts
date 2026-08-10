import { Module } from '@nestjs/common';
import { AuthController } from './modules/auth/presentation/auth.controller';
import { AuthClient } from './modules/auth/clients/auth.client';
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

  controllers: [AuthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    AuthClient,
    HttpClientService,
    ConfigService

  ],
})
export class AppModule { }
