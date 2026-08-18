import { Injectable, Logger } from '@nestjs/common';
import { OrderRepository } from '@order-service/modules/orders/domain/repositories/order.repository';
import { OrderEntity } from '@order-service/modules/orders/domain/entities/order.entity';

@Injectable()
export class GetOrdersUseCase {
    private readonly logger = new Logger(GetOrdersUseCase.name);

    constructor(private readonly orderRepository: OrderRepository) { }

    async execute(): Promise<OrderEntity[]> {
        this.logger.log(`Fetching all orders`);
        return this.orderRepository.findAll();
    }
}
