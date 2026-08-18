import { Injectable } from '@nestjs/common';
import { InventoryRepository } from '@inventory-service/modules/inventory/domain/repositories/inventory.repository';
import { InventoryEntity } from '@inventory-service/modules/inventory/domain/entities/inventory.entity';
import { InventoryReservationEntity, ReservationStatus } from '@inventory-service/modules/inventory/domain/entities/inventory-reservation.entity';
import { PrismaServiced } from '@inventory-service/infrastructure/persistence/prisma/prisma.service';


@Injectable()
export class PrismaInventoryRepository implements InventoryRepository {
    constructor(private readonly prisma: PrismaServiced) { }

    private toDomain(record: any): InventoryEntity {
        const reservations = record.reservations ? record.reservations.map((res: any) => new InventoryReservationEntity(
            res.id,
            res.inventoryId,
            res.orderId,
            res.quantity,
            res.status as ReservationStatus,
            res.createdAt,
            res.updatedAt
        )) : [];

        return new InventoryEntity(
            record.id,
            record.productId,
            record.quantity,
            record.reservedQuantity,
            record.createdAt,
            record.updatedAt,
            reservations
        );
    }

    async findByProductId(productId: string): Promise<InventoryEntity | null> {
        const record = await this.prisma.inventory.findUnique({
            where: { productId },
            include: { reservations: true }
        });
        if (!record) return null;
        return this.toDomain(record);
    }

    async save(inventory: InventoryEntity): Promise<InventoryEntity> {
        // Upsert inventory and sync reservations in a transaction
        const updatedRecord = await this.prisma.$transaction(async (tx) => {
            const invRecord = await tx.inventory.upsert({
                where: { id: inventory.id },
                create: {
                    id: inventory.id,
                    productId: inventory.productId,
                    quantity: inventory.quantity,
                    reservedQuantity: inventory.reservedQuantity
                },
                update: {
                    quantity: inventory.quantity,
                    reservedQuantity: inventory.reservedQuantity
                }
            });

            // Upsert all reservations
            for (const res of inventory.reservations) {
                await tx.inventoryReservation.upsert({
                    where: { id: res.id },
                    create: {
                        id: res.id,
                        inventoryId: invRecord.id,
                        orderId: res.orderId,
                        quantity: res.quantity,
                        status: res.status
                    },
                    update: {
                        status: res.status
                    }
                });
            }

            // Fetch final state with relations
            return await tx.inventory.findUnique({
                where: { id: invRecord.id },
                include: { reservations: true }
            });
        });

        return this.toDomain(updatedRecord);
    }
}
