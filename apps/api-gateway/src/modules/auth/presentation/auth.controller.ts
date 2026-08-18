// api-gateway/src/modules/auth/presentation/auth.controller.ts

import { Body, Controller, Post } from '@nestjs/common';
import { AuthClient } from '@api-gateway/modules/auth/clients/auth.client';
import { RegisterRequestDto } from '@api-gateway/modules/auth/presentation/dto/register.request.dto';
import { LoginRequestDto } from '@api-gateway/modules/auth/presentation/dto/login.request.dto';
import { MeRequestDto } from '@api-gateway/modules/auth/presentation/dto/me.request.dto';
import { RefreshRequestDto } from '@api-gateway/modules/auth/presentation/dto/refresh.request.dto';
import { LogoutRequestDto } from '@api-gateway/modules/auth/presentation/dto/logout.request.dto';
import { VerifyEmailRequestDto } from '@api-gateway/modules/auth/presentation/dto/verify-email.request.dto';
import { ForgotPasswordRequestDto } from '@api-gateway/modules/auth/presentation/dto/forgot-password.request.dto';
import { ResetPasswordRequestDto } from '@api-gateway/modules/auth/presentation/dto/reset-password.request.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authClient: AuthClient,
    ) { }


    @Post('register')
    async register(@Body() body: RegisterRequestDto) {
        const response = await this.authClient.register(body);
        return response.data;
    }

    @Post('login')
    async login(@Body() body: LoginRequestDto) {
        const response = await this.authClient.login(body);
        return response.data;
    }

    @Post('me')
    async getMe(@Body() body: MeRequestDto) {
        const response = await this.authClient.getMe(body);
        return response.data;
    }


    @Post('refresh')
    async refresh(@Body() body: RefreshRequestDto) {
        const response = await this.authClient.refresh(body);
        return response.data;
    }

    @Post('logout')
    async logout(@Body() body: LogoutRequestDto) {
        const response = await this.authClient.logout(body);
        return response.data;
    }

    @Post('verify-email')
    async verifyEmail(@Body() body: VerifyEmailRequestDto) {
        const response = await this.authClient.verifyEmail(body);
        return response.data;
    }

    @Post('forgot-password')
    async forgotPassword(@Body() body: ForgotPasswordRequestDto) {
        const response = await this.authClient.forgotPassword(body);
        return response.data;
    }

    @Post('reset-password')
    async resetPassword(@Body() body: ResetPasswordRequestDto) {
        const response = await this.authClient.resetPassword(body);
        return response.data;
    }
}