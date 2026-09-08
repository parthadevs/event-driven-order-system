import { ReservationStatus } from '@prisma/client';
import { DomainException } from '../exceptions/domain.exception';

export { ReservationStatus };

export class InventoryReservationEntity {
  constructor(
    public readonly id: string,
    public readonly inventoryId: string,
    public readonly orderId: string,
    public readonly quantity: number,
    public status: ReservationStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly expiresAt: Date | null = null,
  ) {}

  public confirm(): void {
    if (this.status !== ReservationStatus.RESERVED) {
      throw new DomainException(
        `Cannot confirm reservation that is in ${this.status} state`,
      );
    }
    this.status = ReservationStatus.CONFIRMED;
  }

  public release(): void {
    if (this.status !== ReservationStatus.RESERVED) {
      throw new DomainException(
        `Cannot release reservation that is in ${this.status} state`,
      );
    }
    this.status = ReservationStatus.RELEASED;
  }

  public expire(now: Date = new Date()): void {
    if (this.status !== ReservationStatus.RESERVED) {
      throw new DomainException(
        `Cannot expire reservation that is in ${this.status} state`,
      );
    }
    if (this.expiresAt && this.expiresAt.getTime() > now.getTime()) {
      throw new DomainException(
        `Reservation for order ${this.orderId} has not expired yet`,
      );
    }
    this.status = ReservationStatus.EXPIRED;
  }

  public isExpired(now: Date = new Date()): boolean {
    return (
      this.status === ReservationStatus.RESERVED &&
      this.expiresAt !== null &&
      this.expiresAt.getTime() <= now.getTime()
    );
  }
}
