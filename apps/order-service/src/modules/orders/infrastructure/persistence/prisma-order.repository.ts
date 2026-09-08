import { Injectable } from '@nestjs/common';
import { PrismaService } from '@order-service/infrastructure/persistence/prisma/prisma.service';
import { OrderEntity } from '@order-service/modules/orders/domain/entities/order.entity';
import {
  OrderItemEntity,
  OrderStatus,
} from '@order-service/modules/orders/domain/entities/order-item.entity';
import { OrderRepository } from '@order-service/modules/orders/domain/repositories/order.repository';

@Injectable()
export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(record: any): OrderEntity {
    const items = record.items
      ? record.items.map(
          (item) =>
            new OrderItemEntity(
              item.id,
              item.orderId,
              item.productId,
              item.productName,
              item.quantity,
              item.price.toNumber(),
              item.createdAt,
              item.updatedAt,
            ),
        )
      : [];

    return new OrderEntity(
      record.id,
      record.userId,
      record.status as OrderStatus,
      record.totalAmount.toNumber(),
      items,
      record.createdAt,
      record.updatedAt,
    );
  }

  async create(order: OrderEntity): Promise<OrderEntity> {
    const record = await this.prisma.order.create({
      data: {
        id: order.id,
        userId: order.userId,
        status: order.status,
        totalAmount: order.totalAmount,
        items: {
          create: order.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { items: true },
    });

    return this.toDomain(record);
  }

  async findById(id: string): Promise<OrderEntity | null> {
    const record = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!record) return null;
    return this.toDomain(record);
  }

  async findAll(): Promise<OrderEntity[]> {
    const records = await this.prisma.order.findMany({
      include: { items: true },
    });

    return records.map((record) => this.toDomain(record));
  }

  async updateStatus(id: string, status: OrderStatus): Promise<OrderEntity> {
    const record = await this.prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });

    return this.toDomain(record);
  }
}
