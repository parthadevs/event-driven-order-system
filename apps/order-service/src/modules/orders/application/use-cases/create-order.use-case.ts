import { Injectable, Logger } from '@nestjs/common';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderEntity } from '@order-service/modules/orders/domain/entities/order.entity';
import {
  OrderItemEntity,
  OrderStatus,
} from '@order-service/modules/orders/domain/entities/order-item.entity';
import { OrderRepository } from '@order-service/modules/orders/domain/repositories/order.repository';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreateOrderUseCase {
  private readonly logger = new Logger(CreateOrderUseCase.name);

  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(dto: CreateOrderDto): Promise<OrderEntity> {
    this.logger.log(`Creating order for user ${dto.userId}`);

    const orderId = uuidv4();
    const items = dto.items.map(
      (item) =>
        new OrderItemEntity(
          uuidv4(),
          orderId,
          item.productId,
          item.productName,
          item.quantity,
          item.price,
          new Date(),
          new Date(),
        ),
    );

    const order = new OrderEntity(
      orderId,
      dto.userId,
      OrderStatus.PENDING,
      0,
      items,
      new Date(),
      new Date(),
    );

    order.recalculateTotal();

    // In a real event-driven system, we might emit an 'OrderCreated' event here
    // For now, we just persist it
    const savedOrder = await this.orderRepository.create(order);
    this.logger.log(`Order ${savedOrder.id} created successfully`);

    return savedOrder;
  }
}
