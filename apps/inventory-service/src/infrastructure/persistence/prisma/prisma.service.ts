import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
  Optional,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

interface PrismaQueryEvent {
  query: string;
  params: string;
  duration: number;
  timestamp: Date;
}

@Injectable()
export class PrismaServiced
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaServiced.name);

  constructor(@Optional() private config?: ConfigService) {
    const connectionString = config?.get
      ? config.get<string>('INVENTORY_DATABASE_URL')
      : process.env.INVENTORY_DATABASE_URL;
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    (this as any).$on('query', (event: PrismaQueryEvent) => {
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
