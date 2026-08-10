import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@app/config';

@Injectable()
export class AuthClient {
    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService

    ) {

        console.log('auth client started', this.configService.get('AUTH_SERVICE_URL'));
    }

    async register(data: unknown) {
        const response = await firstValueFrom(
            this.httpService.post(
                `${this.configService.get('AUTH_SERVICE_URL')}/users`,
                data,
            ),
        );

        return response.data;
    }

    async login(data: unknown) {
        const response = await firstValueFrom(
            this.httpService.post(
                `${this.configService.get('AUTH_SERVICE_URL')}/auth/login`,
                data,
            ),
        );

        return response.data;
    }

    async refresh(data: unknown) {
        const response = await firstValueFrom(
            this.httpService.post(
                `${this.configService.get('AUTH_SERVICE_URL')}/auth/refresh`,
                data,
            ),
        );

        return response.data;
    }

    async logout(data: unknown) {
        const response = await firstValueFrom(
            this.httpService.post(
                `${this.configService.get('AUTH_SERVICE_URL')}/auth/logout`,
                data,
            ),
        );

        return response.data;
    }

    async verifyEmail(data: unknown) {
        const response = await firstValueFrom(
            this.httpService.post(
                `${this.configService.get('AUTH_SERVICE_URL')}/auth/verify-email`,
                data,
            ),
        );

        return response.data;
    }

    async forgotPassword(data: unknown) {
        const response = await firstValueFrom(
            this.httpService.post(
                `${this.configService.get('AUTH_SERVICE_URL')}/auth/forgot-password`,
                data,
            ),
        );

        return response.data;
    }

    async resetPassword(data: unknown) {
        const response = await firstValueFrom(
            this.httpService.post(
                `${this.configService.get('AUTH_SERVICE_URL')}/auth/reset-password`,
                data,
            ),
        );

        return response.data;
    }
}
