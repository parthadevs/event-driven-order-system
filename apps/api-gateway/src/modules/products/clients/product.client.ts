import { Injectable } from '@nestjs/common';
import { ConfigService } from '@app/config';
import { HttpClientService } from '@api-gateway/infrastructure/http/http-client.service';
import {
  CreateProductRequestDto,
  ListProductsQueryDto,
  UpdateProductRequestDto,
} from '../presentation/dto/product.request.dto';

@Injectable()
export class ProductClient {
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpClient: HttpClientService,
  ) {
    this.baseUrl =
      this.configService.get<string>('PRODUCT_SERVICE_URL') ?? '';
  }

  async create(dto: CreateProductRequestDto) {
    return this.httpClient.post(this.baseUrl, dto);
  }

  async list(query: ListProductsQueryDto) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params.set(k, String(v));
    });
    const qs = params.toString();
    return this.httpClient.get(qs ? `${this.baseUrl}?${qs}` : this.baseUrl);
  }

  async getById(id: string) {
    return this.httpClient.get(`${this.baseUrl}/${id}`);
  }

  async getBySku(sku: string) {
    return this.httpClient.get(`${this.baseUrl}/sku/${sku}`);
  }

  async update(id: string, dto: UpdateProductRequestDto) {
    return this.httpClient.patch(`${this.baseUrl}/${id}`, dto);
  }

  async delete(id: string) {
    return this.httpClient.delete(`${this.baseUrl}/${id}`);
  }
}