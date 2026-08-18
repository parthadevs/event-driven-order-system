import { DomainException } from '@inventory-service/modules/inventory/domain/exceptions/domain.exception';
import { InventoryReservationEntity, ReservationStatus } from '@inventory-service/modules/inventory/domain/entities/inventory-reservation.entity';

export class InventoryEntity {
    constructor(
        public readonly id: string,
        public readonly productId: string,
        public quantity: number,
        public reservedQuantity: number,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
        public reservations: InventoryReservationEntity[] = []
    ) { }

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
            throw new DomainException(`Insufficient available quantity for product ${this.productId}`);
        }
        this.quantity -= amount;
    }

    public reserve(quantity: number, orderId: string, reservationId: string): InventoryReservationEntity {
        if (quantity <= 0) {
            throw new DomainException('Reservation quantity must be greater than zero');
        }
        if (this.availableQuantity < quantity) {
            throw new DomainException(`Insufficient available quantity for product ${this.productId} to reserve ${quantity}`);
        }

        this.reservedQuantity += quantity;

        const reservation = new InventoryReservationEntity(
            reservationId,
            this.id,
            orderId,
            quantity,
            ReservationStatus.RESERVED,
            new Date(),
            new Date()
        );
        this.reservations.push(reservation);
        return reservation;
    }

    public confirmReservation(orderId: string): void {
        const reservation = this.reservations.find(r => r.orderId === orderId && r.status === ReservationStatus.RESERVED);
        if (!reservation) {
            throw new DomainException(`Active reservation not found for order ${orderId}`);
        }

        reservation.confirm();
        // The reserved quantity turns into permanently deducted quantity
        this.reservedQuantity -= reservation.quantity;
        this.quantity -= reservation.quantity;
    }

    public releaseReservation(orderId: string): void {
        const reservation = this.reservations.find(r => r.orderId === orderId && r.status === ReservationStatus.RESERVED);
        if (!reservation) {
            throw new DomainException(`Active reservation not found for order ${orderId}`);
        }

        reservation.release();
        // The reserved quantity is freed back into available pool
        this.reservedQuantity -= reservation.quantity;
    }
}
