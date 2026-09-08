import { Injectable } from '@nestjs/common';
import { HttpClientService } from '../../../infrastructure/http/http-client.service';
import { ConfigService } from '@app/config';
import { RegisterRequestDto } from '../presentation/dto/register.request.dto';
import { LoginRequestDto } from '../presentation/dto/login.request.dto';
import { RefreshRequestDto } from '../presentation/dto/refresh.request.dto';
import { MeRequestDto } from '../presentation/dto/me.request.dto';
import { LogoutRequestDto } from '../presentation/dto/logout.request.dto';
import { VerifyEmailRequestDto } from '../presentation/dto/verify-email.request.dto';
import { ForgotPasswordRequestDto } from '../presentation/dto/forgot-password.request.dto';
import { ResetPasswordRequestDto } from '../presentation/dto/reset-password.request.dto';

@Injectable()
export class AuthClient {
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpClient: HttpClientService,
  ) {
    this.baseUrl = this.configService.get<string>('AUTH_SERVICE_URL') || '';
    console.log('auth client started', this.baseUrl);
  }

  private async post(endpoint: string, data: unknown) {
    const response = await this.httpClient.post(
      `${this.baseUrl}${endpoint}`,
      data,
    );
    return response;
  }

  async register(data: RegisterRequestDto) {
    return this.post('/auth/register', data);
  }

  async login(data: LoginRequestDto) {
    return this.post('/auth/login', data);
  }

  async refresh(data: RefreshRequestDto) {
    return this.post('/auth/refresh', data);
  }

  async getMe(data: MeRequestDto) {
    return this.post('/auth/me', data);
  }

  async logout(data: LogoutRequestDto) {
    return this.post('/auth/logout', data);
  }

  async verifyEmail(data: VerifyEmailRequestDto) {
    return this.post('/auth/verify-email', data);
  }

  async forgotPassword(data: ForgotPasswordRequestDto) {
    return this.post('/auth/forgot-password', data);
  }

  async resetPassword(data: ResetPasswordRequestDto) {
    return this.post('/auth/reset-password', data);
  }
}
