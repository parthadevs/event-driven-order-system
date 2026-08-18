import { OrderItemEntity, OrderStatus } from './order-item.entity';
import { DomainException } from '@order-service/modules/orders/domain/exceptions/domain.exception';

export class OrderEntity {
    constructor(
        public readonly id: string,
        public readonly userId: string,
        public status: OrderStatus,
        public totalAmount: number,
        public items: OrderItemEntity[],
        public readonly createdAt: Date,
        public readonly updatedAt: Date
    ) { }

    public cancel(): void {
        if (this.status === OrderStatus.DELIVERED || this.status === OrderStatus.SHIPPED) {
            throw new DomainException(`Cannot cancel an order with status ${this.status}`);
        }
        if (this.status === OrderStatus.CANCELLED) {
            throw new DomainException('Order is already cancelled');
        }
        this.status = OrderStatus.CANCELLED;
    }

    public recalculateTotal(): void {
        this.totalAmount = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
}
