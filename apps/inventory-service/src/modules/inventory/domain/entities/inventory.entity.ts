import { ReservationStatus } from '@prisma/client';
import { DomainException } from '../exceptions/domain.exception';
import { InventoryReservationEntity } from './inventory-reservation.entity';

export const RESERVATION_DEFAULT_TTL_MS = Number(
  process.env.INVENTORY_RESERVATION_TTL_MS ?? 15 * 60 * 1000,
);

export class InventoryEntity {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public quantity: number,
    public reservedQuantity: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public reservations: InventoryReservationEntity[] = [],
    public version: number = 0,
    public readonly reservationTtlMs: number = RESERVATION_DEFAULT_TTL_MS,
  ) {}

  public get availableQuantity(): number {
    return this.quantity - this.reservedQuantity;
  }

  public addQuantity(amount: number): void {
    if (amount <= 0) {
      throw new DomainException('Amount must be greater than zero');
    }
    this.quantity += amount;
  }

  public removeQuantity(amount: number): void {
    if (amount <= 0) {
      throw new DomainException('Amount must be greater than zero');
    }
    if (this.availableQuantity < amount) {
      throw new DomainException(
        `Insufficient available quantity for product ${this.productId}`,
      );
    }
    this.quantity -= amount;
  }

  public adjust(targetQuantity: number): void {
    if (targetQuantity < 0) {
      throw new DomainException('Target quantity cannot be negative');
    }
    if (targetQuantity < this.reservedQuantity) {
      throw new DomainException(
        `Cannot adjust below reserved quantity (${this.reservedQuantity}) for product ${this.productId}`,
      );
    }
    this.quantity = targetQuantity;
  }

  public reserve(
    quantity: number,
    orderId: string,
    reservationId: string,
    now: Date = new Date(),
  ): InventoryReservationEntity {
    if (quantity <= 0) {
      throw new DomainException(
        'Reservation quantity must be greater than zero',
      );
    }

    const existing = this.reservations.find(
      (r) => r.orderId === orderId && r.status === ReservationStatus.RESERVED,
    );
    if (existing) {
      throw new DomainException(
        `An active reservation already exists for order ${orderId}`,
      );
    }

    if (this.availableQuantity < quantity) {
      throw new DomainException(
        `Insufficient available quantity for product ${this.productId} to reserve ${quantity}`,
      );
    }

    this.reservedQuantity += quantity;

    const expiresAt = new Date(now.getTime() + this.reservationTtlMs);
    const reservation = new InventoryReservationEntity(
      reservationId,
      this.id,
      orderId,
      quantity,
      ReservationStatus.RESERVED,
      now,
      now,
      expiresAt,
    );
    this.reservations.push(reservation);
    return reservation;
  }

  public confirmReservation(orderId: string): InventoryReservationEntity {
    const reservation = this.reservations.find(
      (r) => r.orderId === orderId && r.status === ReservationStatus.RESERVED,
    );
    if (!reservation) {
      throw new DomainException(
        `Active reservation not found for order ${orderId}`,
      );
    }

    reservation.confirm();
    this.reservedQuantity -= reservation.quantity;
    this.quantity -= reservation.quantity;
    return reservation;
  }

  public releaseReservation(orderId: string): InventoryReservationEntity {
    const reservation = this.reservations.find(
      (r) => r.orderId === orderId && r.status === ReservationStatus.RESERVED,
    );
    if (!reservation) {
      throw new DomainException(
        `Active reservation not found for order ${orderId}`,
      );
    }

    reservation.release();
    this.reservedQuantity -= reservation.quantity;
    return reservation;
  }

  public expireReservations(
    now: Date = new Date(),
  ): InventoryReservationEntity[] {
    const expired: InventoryReservationEntity[] = [];
    for (const reservation of this.reservations) {
      if (reservation.isExpired(now)) {
        reservation.expire(now);
        this.reservedQuantity -= reservation.quantity;
        expired.push(reservation);
      }
    }
    return expired;
  }
}
