import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OrderRepository } from '@order-service/modules/orders/domain/repositories/order.repository';
import { OrderEntity } from '@order-service/modules/orders/domain/entities/order.entity';

@Injectable()
export class GetOrderByIdUseCase {
    private readonly logger = new Logger(GetOrderByIdUseCase.name);

    constructor(private readonly orderRepository: OrderRepository) { }

    async execute(id: string): Promise<OrderEntity> {
        this.logger.log(`Fetching order by id: ${id}`);
        const order = await this.orderRepository.findById(id);

        if (!order) {
            throw new NotFoundException(`Order with id ${id} not found`);
        }

        return order;
    }
}
