import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@app/config";
import * as crypto from 'crypto';
import { JwtTokenService } from "@auth-service/security/jwt/jwt-token.service";
import { AuthSessionRepository } from "@auth-service/modules/auth/domain/repositories/auth-session.repository";
import { UserRepository } from "@auth-service/modules/users/domain/repositories/user.repository";
import { RefreshTokenDto } from "../dto/refresh-token.dto";
import { RevocationReason } from "../../domain/entities/auth-session.entity";

@Injectable()
export class RefreshTokenUseCase {
    private readonly log = new Logger(RefreshTokenUseCase.name);

    constructor(
        private readonly jwtTokenService: JwtTokenService,
        private readonly authSessionRepository: AuthSessionRepository,
        private readonly userRepository: UserRepository,
        private readonly configService: ConfigService,
    ) { }

    async execute(input: RefreshTokenDto) {
        this.log.log(`Request: Refresh Token`);
        const { refreshToken } = input;

        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token is missing');
        }

        // 1. Verify token signature
        let payload: any;
        try {
            payload = await this.jwtTokenService.verifyToken(refreshToken, this.configService.get<string>('REFRESH_TOKEN_SECRET') || this.configService.get<string>('JWT_SECRET'));
        } catch (e) {
            this.log.error(`Failed to verify refresh token: ${refreshToken}`, e);
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        if (payload.type !== 'refresh') {
            throw new UnauthorizedException('Invalid token type');
        }

        // 2. Hash token and check if it exists in DB
        const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
        const authSession = await this.authSessionRepository.findByTokenHash(tokenHash);

        if (!authSession) {
            throw new UnauthorizedException('Session not found');
        }

        // 3. Check for reuse
        if (authSession.revokedAt) {
            const familyTokens = await this.authSessionRepository.findByFamily(authSession.family);
            for (const t of familyTokens) {
                if (!t.revokedAt) {
                    t.revokedAt = new Date();
                    t.revocationReason = RevocationReason.TOKEN_REUSE_DETECTED;
                    await this.authSessionRepository.update(t);
                }
            }
            throw new UnauthorizedException('Token reuse detected. Please login again.');
        }

        if (authSession.expiresAt < new Date()) {
            throw new UnauthorizedException('Session expired');
        }

        // 4. Find user
        const user = await this.userRepository.findById(authSession.userId);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // 5. Revoke current token
        authSession.revokedAt = new Date();
        authSession.revocationReason = RevocationReason.ROTATED;
        await this.authSessionRepository.update(authSession);

        // 6. Generate new tokens
        const accessToken = await this.jwtTokenService.generateToken(
            {
                sub: user.id,
                email: user.email,
                role: user.role,
                type: 'access',
            },
            {
                secret: this.configService.get<string>('JWT_SECRET'),
                expiresIn: this.configService.get<string>('JWT_EXPIRATION') || '15m',
            },
        );

        const newRefreshTokenValue = crypto.randomBytes(64).toString('hex');
        const newRefreshToken = await this.jwtTokenService.generateToken(
            {
                sub: user.id,
                email: user.email,
                type: 'refresh',
                jti: newRefreshTokenValue,
            },
            {
                secret: this.configService.get<string>('REFRESH_TOKEN_SECRET') || this.configService.get<string>('JWT_SECRET'),
                expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRATION') || '30d',
            },
        );

        // 7. Save new session
        const newHashedRefreshToken = crypto.createHash("sha256").update(newRefreshToken).digest("hex");
        const expiresInDays = parseInt(this.configService.get<string>('REFRESH_TOKEN_EXPIRATION') || '30', 10);
        const newExpiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

        await this.authSessionRepository.create({
            userId: user.id,
            tokenHash: newHashedRefreshToken,
            family: authSession.family,
            expiresAt: newExpiresAt,
            ipAddress: null as any,
            userAgent: null as any,
        });

        return {
            success: true,
            code: 200,
            message: "Tokens refreshed successfully",
            timestamp: new Date().toISOString(),
            data: {
                accessToken,
                refreshToken: newRefreshToken
            }
        };
    }
}