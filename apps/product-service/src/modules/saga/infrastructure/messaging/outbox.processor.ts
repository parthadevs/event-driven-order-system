import { Injectable, Logger, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@product-service/infrastructure/persistence/prisma/prisma.service';

@Injectable()
export class OutboxProcessor {
  private readonly logger = new Logger(OutboxProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('INVENTORY_SERVICE') private readonly rabbitClient: ClientProxy,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async processOutboxEvents() {
    this.logger.log("Start Outbox Processing");
    try {
      const pendingEvents = await this.prisma.outboxEvent.findMany({
        where: { status: 'PENDING' },
        take: 50,
        orderBy: { createdAt: 'asc' },
      });

      if (pendingEvents.length === 0) return;

      for (const event of pendingEvents) {
        try {
          let parsedPayload: unknown;
          if (typeof event.payload === 'string') {
            parsedPayload = JSON.parse(event.payload);
          } else {
            parsedPayload = event.payload;
          }

          this.rabbitClient.emit(event.eventType, parsedPayload as any);

          await this.prisma.outboxEvent.update({
            where: { id: event.id },
            data: { status: 'PROCESSED' },
          });

          this.logger.log(
            `Outbox event [${event.eventType}] dispatched successfully for ID: ${event.aggregateId}`,
          );
        } catch (err) {
          this.logger.error(
            `Failed to dispatch outbox event ${event.id}: ${(err as Error).message}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Error in OutboxProcessor cron: ${(error as Error).message}`,
      );
    }
  }
}
