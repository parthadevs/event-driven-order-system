import { Body, Controller, Post } from '@nestjs/common';
import { AuthClient } from '../clients/auth.client';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authClient: AuthClient,
    ) { }

    @Post('register')
    async register(@Body() body: any) {
        const response = await this.authClient.register(body);
        return response.data;
    }

    @Post('login')
    async login(@Body() body: any) {
        const response = await this.authClient.login(body);
        return response.data;
    }

    @Post('refresh')
    async refresh(@Body() body: any) {
        const response = await this.authClient.refresh(body);
        return response.data;
    }

    @Post('logout')
    async logout(@Body() body: any) {
        const response = await this.authClient.logout(body);
        return response.data;
    }

    @Post('verify-email')
    async verifyEmail(@Body() body: any) {
        const response = await this.authClient.verifyEmail(body);
        return response.data;
    }

    @Post('forgot-password')
    async forgotPassword(@Body() body: any) {
        const response = await this.authClient.forgotPassword(body);
        return response.data;
    }

    @Post('reset-password')
    async resetPassword(@Body() body: any) {
        const response = await this.authClient.resetPassword(body);
        return response.data;
    }
}