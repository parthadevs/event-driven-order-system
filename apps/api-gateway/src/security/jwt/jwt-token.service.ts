import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '@app/config';
import { JwtService } from './jwt.service';
import { JwtPayload, TokenGenerationOptions } from './jwt.types';

@Injectable()
export class JwtTokenService implements JwtService {
    constructor(
        private readonly nestJwtService: NestJwtService,
        private readonly configService: ConfigService,
    ) { }

    async generateToken(payload: JwtPayload, options?: TokenGenerationOptions): Promise<string> {
        const secret = options?.secret || this.configService.get<string>('API_GATEWAY_JWT_SECRET');
        const expiresIn = options?.expiresIn || this.configService.get<string>('API_GATEWAY_JWT_EXPIRATION');

        return this.nestJwtService.signAsync(payload, {
            secret,
            expiresIn: expiresIn as any,
        });
    }

    async verifyToken<T extends JwtPayload = JwtPayload>(token: string, secret?: string): Promise<T> {
        try {
            const verifySecret = secret || this.configService.get<string>('API_GATEWAY_JWT_SECRET');
            return await this.nestJwtService.verifyAsync<T>(token, {
                secret: verifySecret,
            });
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }

    decodeToken<T extends JwtPayload = JwtPayload>(token: string): T | null {
        return this.nestJwtService.decode(token) as T | null;
    }
}
