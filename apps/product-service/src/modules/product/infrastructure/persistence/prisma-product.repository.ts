/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { Inject, Injectable } from '@nestjs/common';
import {
  ProductListFilter,
  ProductRepository,
} from '../../domain/repositories/product.repository';
import { ProductEntity } from '../../domain/entities/product.entity';
import { PrismaService } from '../../../../infrastructure/persistence/prisma/prisma.service';

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private toDomain(record: any): ProductEntity {
    return new ProductEntity(
      record.id,
      record.sku,
      record.name,
      record.description ?? null,
      typeof record.price === 'string'
        ? parseFloat(record.price)
        : record.price,
      record.currency,
      record.isActive,
      record.createdAt,
      record.updatedAt,
      record.version ?? 0,
    );
  }

  async create(product: ProductEntity): Promise<ProductEntity> {
    try {
      const created = await this.prisma.product.create({
        data: {
          sku: product.sku,
          name: product.name,
          description: product.description,
          price: product.price,
          currency: product.currency,
          isActive: product.isActive,
        },
      });
      return this.toDomain(created);
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new Error(`Duplicate product SKU '${product.sku}'`);
      }
      throw error;
    }
  }

  async findById(id: string): Promise<ProductEntity | null> {
    const record = await this.prisma.product.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findBySku(sku: string): Promise<ProductEntity | null> {
    const record = await this.prisma.product.findUnique({ where: { sku } });
    return record ? this.toDomain(record) : null;
  }

  async save(product: ProductEntity): Promise<ProductEntity> {
    try {
      const updated = await this.prisma.product.update({
        where: { id: product.id, version: product.version },
        data: {
          name: product.name,
          description: product.description,
          price: product.price,
          currency: product.currency,
          isActive: product.isActive,
          version: { increment: 1 },
        },
      });
      return this.toDomain(updated);
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throw new Error(
          `Product ${product.id} was modified concurrently. Please retry.`,
        );
      }
      throw error;
    }
  }

  async list(
    filter: ProductListFilter,
  ): Promise<{ items: ProductEntity[]; total: number }> {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;
    const where: any = {};
    if (filter.isActive !== undefined) where.isActive = filter.isActive;
    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { sku: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const [records, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items: records.map((r: unknown) => this.toDomain(r)),
      total,
    };
  }
}
