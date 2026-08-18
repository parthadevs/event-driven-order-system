import { Controller, Get, Post } from "@nestjs/common";
import { ConfigService } from '@app/config';
import { HttpClientService } from "apps/api-gateway/src/infrastructure/http/http-client.service";


@Controller('orders')
export class OrdersClient {
    private baseUrl: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly httpClient: HttpClientService
    ) {
        this.baseUrl = this.configService.get<string>('ORDER_SERVICE_URL') || '';
        console.log('order client started', this.baseUrl);
    }


    @Post('/create')
    async createOrder(data: any) {
        return this.httpClient.post(`${this.baseUrl}/create`, data);
    }

    @Get('/get')
    async getOrder() {
        return this.httpClient.get(`${this.baseUrl}/get`);
    }

    @Get('/:orderId')
    async getOrderById(data: any) {
        return this.httpClient.get(`${this.baseUrl}/:orderId`);
    }

    @Post('/:orderId/cancel')
    async cancelOrder(data: any) {
        return this.httpClient.post(`${this.baseUrl}/:orderId/cancel`, data);
    }
}