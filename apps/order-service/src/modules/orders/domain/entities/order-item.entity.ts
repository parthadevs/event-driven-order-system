export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED'
}

export class OrderItemEntity {
    constructor(
        public readonly id: string,
        public readonly orderId: string,
        public readonly productId: string,
        public readonly productName: string,
        public readonly quantity: number,
        public readonly price: number,
        public readonly createdAt: Date,
        public readonly updatedAt: Date
    ) { }
}
