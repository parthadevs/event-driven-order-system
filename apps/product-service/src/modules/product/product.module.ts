import { Module } from '@nestjs/common';
import { ProductController } from './presentation/controllers/product.controller';
import { HealthController } from './presentation/controllers/health.controller';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import {
  GetProductBySkuUseCase,
  GetProductUseCase,
} from './application/use-cases/get-product.use-case';
import { ListProductsUseCase } from './application/use-cases/list-products.use-case';
import { UpdateProductUseCase } from './application/use-cases/update-product.use-case';
import { DeleteProductUseCase } from './application/use-cases/delete-product.use-case';
import { ProductRepository } from './domain/repositories/product.repository';
import { PrismaProductRepository } from './infrastructure/persistence/prisma-product.repository';
import { PrismaService } from '../../infrastructure/persistence/prisma/prisma.service';
import { SagaOrchestrator } from './saga/saga.orchestrator';
import { SagaReplyConsumer } from './saga/saga-reply.consumer';

@Module({
  controllers: [ProductController, HealthController],
  providers: [
    PrismaService,
    {
      provide: ProductRepository,
      useClass: PrismaProductRepository,
    },
    CreateProductUseCase,
    GetProductUseCase,
    GetProductBySkuUseCase,
    ListProductsUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    SagaOrchestrator,
    SagaReplyConsumer,
  ],
  exports: [ProductRepository],
})
export class ProductModule {}
