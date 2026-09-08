import { Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';
import {
  OrderEntity,
  OrderStatus,
} from '@order-service/modules/orders/domain/entities/order.entity';
import { OrderRepository } from '@order-service/modules/orders/domain/repositories/order.repository';
import { PrismaService } from '@order-service/infrastructure/persistence/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

interface ReserveInventoryPayload {
  orderId: string;
  productId: string;
  quantity: number;
}

interface InventoryReservedPayload {
  orderId: string;
  success: boolean;
  reason?: string;
}

@Injectable()
export class RmqSagaOrchestrator {
  private readonly logger = new Logger(RmqSagaOrchestrator.name);

  constructor(
    private readonly inventoryClient: ClientProxy,
    private readonly prisma: PrismaService,
    private readonly orderRepository: OrderRepository,
  ) {}

  async startOrderCreate(
    userId: string,
    productId: string,
    productName: string,
    quantity: number,
    price: number,
  ): Promise<OrderEntity> {
    const orderId = uuidv4();
    this.logger.log(`Starting saga for order ${orderId}`);

    const order = new OrderEntity(
      orderId,
      userId,
      OrderStatus.PENDING,
      price * quantity,
      [],
      new Date(),
      new Date(),
    );

    const savedOrder = await this.prisma.$transaction(async (tx) => {
      const record = await tx.order.create({
        data: {
          id: order.id,
          userId: order.userId,
          status: order.status,
          totalAmount: order.totalAmount,
          items: {
            create: {
              id: uuidv4(),
              productId,
              productName,
              quantity,
              price,
            },
          },
        },
        include: { items: true },
      });

      await tx.outboxEvent.create({
        data: {
          aggregateId: order.id,
          eventType: 'order.created',
          payload: JSON.stringify({
            orderId: record.id,
            userId,
            productId,
            quantity,
            amount: order.totalAmount,
          }),
          status: 'PENDING',
        },
      });

      return record;
    });

    const savedOrderEntity = OrderEntity.toDomain(savedOrder);

    try {
      const response = await firstValueFrom(
        this.inventoryClient
          .send<InventoryReservedPayload>({ cmd: 'reserve' }, {
            orderId,
            productId,
            quantity,
          } satisfies ReserveInventoryPayload)
          .pipe(
            timeout(5_000),
            catchError((err) => {
              this.logger.error(
                `Inventory service timeout/error: ${(err as Error)?.message}`,
              );
              return of({
                orderId,
                success: false,
                reason: 'inventory-service-unreachable',
              } satisfies InventoryReservedPayload);
            }),
          ),
      );

      if (response.success) {
        await this.orderRepository.updateStatus(orderId, OrderStatus.CONFIRMED);
        this.logger.log(`Order ${orderId} confirmed - inventory reserved`);
      } else {
        await this.orderRepository.updateStatus(orderId, OrderStatus.CANCELLED);
        this.logger.warn(
          `Order ${orderId} cancelled - inventory failed: ${response.reason}`,
        );
      }
    } catch (error) {
      await this.orderRepository.updateStatus(orderId, OrderStatus.CANCELLED);
      this.logger.error(
        `Saga failed for order ${orderId}: ${(error as Error).message}`,
      );
    }

    return savedOrderEntity;
  }
}
