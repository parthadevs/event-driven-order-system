import { Injectable } from '@nestjs/common';
import { HttpClientService } from '../../../infrastructure/http/http-client.service';
import { ConfigService } from '@app/config';

@Injectable()
export class AuthClient {
    private readonly baseUrl: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly httpClient: HttpClientService
    ) {
        this.baseUrl = this.configService.get<string>('AUTH_SERVICE_URL') || '';
        console.log('auth client started', this.baseUrl);
    }

    private async post(endpoint: string, data: unknown) {
        const response = await this.httpClient.post(`${this.baseUrl}${endpoint}`, data);
        return response.data;
    }

    async register(data: unknown) {
        return this.post('/auth/register', data);
    }

    async login(data: unknown) {
        return this.post('/auth/login', data);
    }

    async refresh(data: unknown) {
        return this.post('/auth/refresh', data);
    }

    async logout(data: unknown) {
        return this.post('/auth/logout', data);
    }

    async verifyEmail(data: unknown) {
        return this.post('/auth/verify-email', data);
    }

    async forgotPassword(data: unknown) {
        return this.post('/auth/forgot-password', data);
    }

    async resetPassword(data: unknown) {
        return this.post('/auth/reset-password', data);
    }
}
