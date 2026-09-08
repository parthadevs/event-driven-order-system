import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ExpireReservationsUseCase } from '../../application/use-cases/expire-reservations.use-case';

@Injectable()
export class ReservationSweeper implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ReservationSweeper.name);
  private timer: NodeJS.Timeout | null = null;

  private readonly intervalMs = 10000;
  // Number(
  //   process.env.INVENTORY_SWEEPER_INTERVAL_MS ?? 60_000,
  // );

  constructor(private readonly expireReservations: ExpireReservationsUseCase) {}

  onModuleInit() {
    if (process.env.INVENTORY_SWEEPER_DISABLED === 'true') {
      this.logger.warn('Reservation sweeper disabled via env');
      return;
    }
    this.logger.log(
      `Reservation sweeper started (interval=${this.intervalMs}ms)`,
    );
    this.timer = setInterval(() => {
      this.expireReservations
        .execute()
        .catch((err) =>
          this.logger.error(`Sweeper error: ${(err as Error).message}`),
        );
    }, this.intervalMs);
    if (typeof this.timer.unref === 'function') {
      this.timer.unref();
    }
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
