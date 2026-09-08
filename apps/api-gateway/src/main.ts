import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@app/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger()
  process.title = "api-gateway";
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;
  app.enableShutdownHooks()
  await app.listen(port);
  logger.log(`API Gateway is running on port ${port}`);
}
bootstrap();
