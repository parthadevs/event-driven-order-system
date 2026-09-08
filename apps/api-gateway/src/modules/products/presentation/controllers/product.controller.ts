import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ProductClient } from '../../clients/product.client';
import {
  CreateProductRequestDto,
  ListProductsQueryDto,
  UpdateProductRequestDto,
} from '../dto/product.request.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productClient: ProductClient) {}

  @Post()
  create(@Body() dto: CreateProductRequestDto) {
    return this.productClient.create(dto);
  }

  @Get()
  list(@Query() query: ListProductsQueryDto) {
    return this.productClient.list(query);
  }

  @Get('sku/:sku')
  getBySku(@Param('sku') sku: string) {
    return this.productClient.getBySku(sku);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.productClient.getById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductRequestDto) {
    return this.productClient.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.productClient.delete(id);
  }
}