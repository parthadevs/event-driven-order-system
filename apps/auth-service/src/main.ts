import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@app/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  await app.listen(config.get('AUTH_SERVICE_PORT') ?? 3001);
  console.log(`Auth service is running on port ${config.get('AUTH_SERVICE_PORT') ?? 3001}`);
}
bootstrap();
