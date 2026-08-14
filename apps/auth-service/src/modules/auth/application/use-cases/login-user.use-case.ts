import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Logger } from "@nestjs/common";
import { ConfigService } from "@app/config";
import * as crypto from 'crypto';

import { LoginUserDto } from "@auth-service/modules/auth/application/dto/login.dto";
import { ApiResponse } from "@shared/types/api.types";
import { LoginUserOutput } from "@auth-service/modules/auth/application/types/login.types";
import { UserRepository } from "@auth-service/modules/users/domain/repositories/user.repository";
import { PasswordHasher } from "@auth-service/security/password/password-hasher";
import { JwtTokenService } from "@auth-service/security/jwt/jwt-token.service";
import { AuthSessionRepository } from "@auth-service/modules/auth/domain/repositories/auth-session.repository";

@Injectable()
export class LoginUserUseCase {
    private readonly log = new Logger(LoginUserUseCase.name)

    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordHasher: PasswordHasher,
        private readonly jwtTokenService: JwtTokenService,
        private readonly authSessionRepository: AuthSessionRepository,
        private readonly configService: ConfigService,
    ) { }


    async execute(input: LoginUserDto): Promise<ApiResponse<LoginUserOutput>> {

        //1. Validate user
        const user = await this.userRepository.findByEmail(input.email);

        if (!user) {
            this.log.error('User not found: ', input.email);
            throw new NotFoundException('User not found');
        }

        const isPasswordValid = await this.passwordHasher.comparePassword(user.passwordHash, input.password);
        if (!isPasswordValid) {
            this.log.error('Invalid password for user: ', input.email);
            throw new UnauthorizedException('Invalid password');
        }

        //2. Generate tokens
        const accessToken = await this.jwtTokenService.generateToken(
            {
                sub: user.id,
                email: user.email,
                role: user.role,
                type: 'access',
            },
            {
                secret: this.configService.get<string>('API_GATEWAY_JWT_SECRET'),
                expiresIn: this.configService.get<string>('API_GATEWAY_JWT_EXPIRATION') || '15m',
            },
        );

        const refreshTokenValue = crypto.randomBytes(64).toString('hex');
        
        const refreshToken = await this.jwtTokenService.generateToken(
            {
                sub: user.id,
                email: user.email,
                type: 'refresh',
                jti: refreshTokenValue,
            },
            {
                secret: this.configService.get<string>('API_GATEWAY_REFRESH_TOKEN_SECRET') || this.configService.get<string>('API_GATEWAY_JWT_SECRET'),
                expiresIn: this.configService.get<string>('API_GATEWAY_REFRESH_TOKEN_EXPIRATION') || '30d',
            },
        );


        //3. Save AuthSession
        const hashedRefreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex");
        const familyId = crypto.randomUUID();
        
        const expiresInDays = parseInt(this.configService.get<string>('API_GATEWAY_REFRESH_TOKEN_EXPIRATION') || '30', 10);
        const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

        await this.authSessionRepository.create({
            userId: user.id,
            tokenHash: hashedRefreshToken,
            family: familyId,
            expiresAt,
            ipAddress: null as any,
            userAgent: null as any,
        });

        //4. Return Response
        return {
            success: true,
            code: 200,
            message: "User logged in successfully",
            timestamp: new Date().toISOString(),
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                },
                accessToken,
                refreshToken
            }
        };
    }
}