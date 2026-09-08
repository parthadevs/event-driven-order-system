/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
import { Inject, Injectable } from '@nestjs/common';
import { InventoryRepository } from '@inventory-service/modules/inventory/domain/repositories/inventory.repository';
import { InventoryEntity } from '@inventory-service/modules/inventory/domain/entities/inventory.entity';
import {
  InventoryReservationEntity,
  ReservationStatus,
} from '@inventory-service/modules/inventory/domain/entities/inventory-reservation.entity';
import { PrismaServiced } from '@inventory-service/infrastructure/persistence/prisma/prisma.service';

@Injectable()
export class PrismaInventoryRepository implements InventoryRepository {
  constructor(
    @Inject(PrismaServiced) private readonly prisma: PrismaServiced,
  ) {}

  private toDomain(record: any): InventoryEntity {
    const reservations = record.reservations
      ? record.reservations.map(
          (res: any) =>
            new InventoryReservationEntity(
              res.id,
              res.inventoryId,
              res.orderId,
              res.quantity,
              res.status as ReservationStatus,
              res.createdAt,
              res.updatedAt,
              res.expiresAt ?? null,
            ),
        )
      : [];

    return new InventoryEntity(
      record.id,
      record.productId,
      record.quantity,
      record.reservedQuantity,
      record.createdAt,
      record.updatedAt,
      reservations,
      record.version ?? 0,
    );
  }

  async findByProductId(productId: string): Promise<InventoryEntity | null> {
    const record = await this.prisma.inventory.findUnique({
      where: { productId },
      include: { reservations: true },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findById(id: string): Promise<InventoryEntity | null> {
    const record = await this.prisma.inventory.findUnique({
      where: { id },
      include: { reservations: true },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findExpiredReservations(limit = 100): Promise<InventoryEntity[]> {
    const now = new Date();
    void now; // referenced in the where clause
    const records = await this.prisma.inventory.findMany({
      where: {
        reservations: {
          some: {
            status: ReservationStatus.RESERVED,
            // expiresAt: { lt: oneHourAgo, not: null },
          },
        },
      },
      include: { reservations: true },
      take: limit,
    });
    return records.map((r) => this.toDomain(r));
  }

  async save(inventory: InventoryEntity): Promise<InventoryEntity> {
    try {
      const updatedRecord = await this.prisma.$transaction(async (tx: any) => {
        const invRecord = await tx.inventory.update({
          where: {
            id: inventory.id,
            version: inventory.version,
          },
          data: {
            quantity: inventory.quantity,
            reservedQuantity: inventory.reservedQuantity,
            version: { increment: 1 },
          },
        });

        for (const res of inventory.reservations) {
          await tx.inventoryReservation.upsert({
            where: { id: res.id },
            create: {
              id: res.id,
              inventoryId: invRecord.id,
              orderId: res.orderId,
              quantity: res.quantity,
              status: res.status,
              expiresAt: res.expiresAt,
            },
            update: {
              status: res.status,
              expiresAt: res.expiresAt,
            },
          });
        }

        return await tx.inventory.findUnique({
          where: { id: invRecord.id },
          include: { reservations: true },
        });
      });

      return this.toDomain(updatedRecord);
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throw new Error(
          `Inventory ${inventory.id} was modified concurrently. Please retry.`,
        );
      }
      if (error?.code === 'P2002') {
        throw new Error(
          `Duplicate reservation for orderId on inventory ${inventory.id}.`,
        );
      }
      throw error;
    }
  }

  async create(inventory: InventoryEntity): Promise<InventoryEntity> {
    const created = await this.prisma.inventory.create({
      data: {
        id: inventory.id,
        productId: inventory.productId,
        quantity: inventory.quantity,
        reservedQuantity: inventory.reservedQuantity,
      },
      include: { reservations: true },
    });
    return this.toDomain(created);
  }
}
