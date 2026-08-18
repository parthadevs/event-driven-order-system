import { DomainException } from '../exceptions/domain.exception';

export enum ReservationStatus {
    RESERVED = 'RESERVED',
    RELEASED = 'RELEASED',
    CONFIRMED = 'CONFIRMED',
    EXPIRED = 'EXPIRED'
}

export class InventoryReservationEntity {
    constructor(
        public readonly id: string,
        public readonly inventoryId: string,
        public readonly orderId: string,
        public readonly quantity: number,
        public status: ReservationStatus,
        public readonly createdAt: Date,
        public readonly updatedAt: Date
    ) {}

    public confirm(): void {
        if (this.status !== ReservationStatus.RESERVED) {
            throw new DomainException(`Cannot confirm reservation that is in ${this.status} state`);
        }
        this.status = ReservationStatus.CONFIRMED;
    }

    public release(): void {
        if (this.status !== ReservationStatus.RESERVED) {
            throw new DomainException(`Cannot release reservation that is in ${this.status} state`);
        }
        this.status = ReservationStatus.RELEASED;
    }
}
