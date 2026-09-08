import { Controller, Get, Inject } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/persistence/prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get()
  liveness() {
    return {
      status: 'ok',
      service: 'product-service',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  async readiness() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ready', service: 'product-service' };
    } catch (err) {
      return {
        status: 'unavailable',
        service: 'product-service',
        error: (err as Error).message,
      };
    }
  }
}
