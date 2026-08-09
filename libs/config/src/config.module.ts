import { Global, Module } from '@nestjs/common';
import { join } from 'path';
import { ConfigService } from './config.service';
import { ConfigModule as NgxConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [NgxConfigModule.forRoot({
    envFilePath: join(process.cwd(), '.env')
  })],
  providers: [ConfigService],
  exports: [ConfigService, NgxConfigModule],
})
export class ConfigModule { }
