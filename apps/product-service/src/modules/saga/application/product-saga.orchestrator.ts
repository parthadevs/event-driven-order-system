import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@product-service/infrastructure/persistence/prisma/prisma.service';
import { CreateProductDto } from '@product-service/modules/product/application/dto/product.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProductSagaOrchestrator {
  private readonly logger = new Logger(ProductSagaOrchestrator.name);
 
  constructor(private readonly prisma: PrismaService) {}

 async startProductCreateSaga(dto: CreateProductDto) {
    const sagaId = uuidv4();
    this.logger.log(
      `Starting Product Create Saga [${sagaId}] for SKU: ${dto.sku}`,
    );

    try {

      const result = await this.prisma.$transaction(async (tx) => {
        const product = await tx.product.create({
          data: {
            sku: dto.sku,
            name: dto.name,
            slug: dto.slug,
            description: dto.description,
            price: dto.price,
            currency: dto.currency || 'USD',
            images: dto.images || [],
            status: dto.status || 'DRAFT',
            categoryId: dto.categoryId,
            createdBy: dto.createdBy,
          },
        });



        const outboxEvent = await tx.outboxEvent.create({
          data: {
            aggregateId: product.id,
            eventType: 'product.created.event',
            payload: JSON.stringify({
              sagaId,
              productId: product.id,
              sku: product.sku,
              name: product.name,
              slug: product.slug,
              description: product.description,
              price: Number(product.price),
              currency: product.currency,
              images: product.images,
              status: product.status,
              categoryId: product.categoryId,
              initialStock: dto.initialQuantity,
              createdBy: product.createdBy,
            }),
            status: 'PENDING',
          },
        });

        return { product, outboxEvent };
      });

      this.logger.log(
        `Product Saga [${sagaId}] successfully completed. Outbox event queued with full data.`,
      );

      return {
        success: true,
        message: 'Product creation initiated successfully via Saga Outbox',
        productId: result.product.id,
        sagaId,
      };
    } catch (error) {
      this.logger.error(
        `Product Create Saga [${sagaId}] failed: ${(error as Error).message}`,
      );
      throw new Error(
        `Failed to create product via saga: ${(error as Error).message}`,
      );
    }
  }
}
