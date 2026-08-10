import { Module } from '@nestjs/common';
import { AuthController } from './modules/auth/presentation/auth.controller';
import { AuthClient } from './modules/auth/clients/auth.client';
import { HttpClientService } from './infrastructure/http/http-client.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@app/config';

@Module({
  imports: [HttpModule, ConfigModule.forRoot({
    isGlobal: true,
  })],
  controllers: [AuthController],
  providers: [AuthClient, HttpClientService, ConfigService],
})
export class AppModule { }
