import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  Optional,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(@Optional() private config?: ConfigService) {
    const connectionString = config?.get
      ? config.get<string>('PRODUCT_DATABASE_URL')
      : process.env.PRODUCT_DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'error' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
      ],
    });
  }

  async onModuleInit() {
    await this.connectWithRetry();
    this.registerQueryLogger();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private registerQueryLogger(): void {
    (
      this as unknown as {
        $on: (
          e: string,
          cb: (ev: { duration: number; query: string; params: string }) => void,
        ) => void;
      }
    ).$on('query', (event) => {
      if (event.duration > 200) {
        this.logger.warn(
          `Slow query (${event.duration}ms): ${event.query} -- params: ${event.params}`,
        );
      }
    });
  }

  private async connectWithRetry(): Promise<void> {
    this.logger.log('Connecting to database with retry');
    const maxRetries = 10;
    const delay = 1000;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.$connect();
        this.logger.log('Database connected successfully');
        return;
      } catch (error) {
        this.logger.error(`Attempt ${attempt} failed:`, error);
        if (attempt === maxRetries) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
}
