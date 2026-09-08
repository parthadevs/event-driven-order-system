import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { RevocationReason } from '@auth-service/modules/auth/domain/entities/auth-session.entity';
import { AuthSessionRepository } from '@auth-service/modules/auth/domain/repositories/auth-session.repository';
import { RefreshTokenDto } from '@auth-service/modules/auth/application/dto/refresh-token.dto';

@Injectable()
export class LogoutUseCase {
  private readonly log = new Logger(LogoutUseCase.name);

  constructor(private readonly authSessionRepository: AuthSessionRepository) {}

  async execute(input: RefreshTokenDto) {
    const { refreshToken } = input;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');
    const authSession =
      await this.authSessionRepository.findByTokenHash(tokenHash);

    if (authSession && !authSession.revokedAt) {
      authSession.revokedAt = new Date();
      authSession.revocationReason = RevocationReason.LOGOUT;
      await this.authSessionRepository.update(authSession);
    }

    return {
      success: true,
      code: 200,
      message: 'User logged out successfully',
      timestamp: new Date().toISOString(),
    };
  }
}
