import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { PrismaService } from '@product-service/infrastructure/persistence/prisma/prisma.service';
import { ProductStatusEnum } from '@product-service/modules/product/application/dto/product.dto';

@Controller()
export class ProductEventConsumer {
  private readonly logger = new Logger(ProductEventConsumer.name);

  constructor(private readonly prisma: PrismaService) {}

  @EventPattern('inventory.reservation.failed')
  async handleInventoryFailed(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    const { productId, sagaId } = data;
    this.logger.warn(`Compensation triggered for Saga [${sagaId}]. Inventory failed for Product: ${productId}`);

    try {
      await this.prisma.product.update({
        where: { id: productId },
        data: { 
          status: ProductStatusEnum.ARCHIVED, 
          isActive: false 
        },
      });

      this.logger.log(`Compensation successful: Product [${productId}] marked as ARCHIVED.`);
      channel.ack(originalMessage);
    } catch (error) {
      this.logger.error(`Failed to execute compensation for product ${productId}: ${(error as Error).message}`);
      channel.nack(originalMessage, false, false);
    }
  }
}