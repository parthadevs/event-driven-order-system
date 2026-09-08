import { OrderEntity } from '@order-service/modules/orders/domain/entities/order.entity';
import { OrderStatus } from '@order-service/modules/orders/domain/entities/order-item.entity';

export abstract class OrderRepository {
  abstract create(order: OrderEntity): Promise<OrderEntity>;
  abstract findById(id: string): Promise<OrderEntity | null>;
  abstract findAll(): Promise<OrderEntity[]>;
  abstract updateStatus(id: string, status: OrderStatus): Promise<OrderEntity>;
}
