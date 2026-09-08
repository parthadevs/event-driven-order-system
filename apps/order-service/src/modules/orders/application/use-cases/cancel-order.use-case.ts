import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OrderRepository } from '@order-service/modules/orders/domain/repositories/order.repository';
import { OrderEntity } from '@order-service/modules/orders/domain/entities/order.entity';

@Injectable()
export class CancelOrderUseCase {
  private readonly logger = new Logger(CancelOrderUseCase.name);

  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(id: string): Promise<OrderEntity> {
    this.logger.log(`Cancelling order: ${id}`);
    const order = await this.orderRepository.findById(id);

    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    // Domain logic for cancellation
    order.cancel();

    const updatedOrder = await this.orderRepository.updateStatus(
      id,
      order.status,
    );
    this.logger.log(`Order ${id} cancelled successfully`);

    return updatedOrder;
  }
}
