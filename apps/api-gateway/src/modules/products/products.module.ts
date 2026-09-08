import { Module } from '@nestjs/common';
import { ProductClient } from './clients/product.client';
import { ProductController } from './presentation/controllers/product.controller';

@Module({
  controllers: [ProductController],
  providers: [ProductClient],
  exports: [ProductClient],
})
export class ProductsModule {}