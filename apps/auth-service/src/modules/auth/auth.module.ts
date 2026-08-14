import { Module } from "@nestjs/common";
import { ForgotPasswordUseCase } from "@auth-service/modules/auth/application/use-cases/forgot-password.use-case";
import { LoginUserUseCase } from "@auth-service/modules/auth/application/use-cases/login-user.use-case";
import { LogoutAllUseCase } from "@auth-service/modules/auth/application/use-cases/logout-all.use-case";
import { LogoutUseCase } from "@auth-service/modules/auth/application/use-cases/logout.use-case";
import { RefreshTokenUseCase } from "@auth-service/modules/auth/application/use-cases/refresh-token.use-case";
import { ResetPasswordUseCase } from "@auth-service/modules/auth/application/use-cases/reset-password.use-case";
import { VerifyEmailUseCase } from "@auth-service/modules/auth/application/use-cases/verify-email.use-case";
import { CreateUserUseCase } from "@auth-service/modules/auth/application/use-cases/create-user.use-case";
import { AuthServiceController } from "@auth-service/modules/auth/presentation/controllers/auth.controller";
import { PrismaUserRepository } from "@auth-service/modules/users/infrastructure/persistence/prisma-user.repository";
import { PasswordHasher } from "@auth-service/security/password/password-hasher";
import { UserRepository } from "@auth-service/modules/users/domain/repositories/user.repository";
import { PasswordResetTokenRepository } from "@auth-service/modules/auth/domain/repositories/password-reset-token.repository";
import { PrismaPasswordResetRepository } from "@auth-service/modules/auth/infrastructure/persistence/prisma-password-reset.repository";
import { AuthSessionRepository } from "@auth-service/modules/auth/domain/repositories/auth-session.repository";
import { PrismaAuthSessionRepository } from "@auth-service/modules/auth/infrastructure/persistence/prisma-auth-session.repository";

@Module({
    providers: [
        PrismaUserRepository,
        {
            provide: UserRepository,
            useExisting: PrismaUserRepository,
        },
        PrismaPasswordResetRepository,
        {
            provide: PasswordResetTokenRepository,
            useExisting: PrismaPasswordResetRepository,
        },
        PrismaAuthSessionRepository,
        {
            provide: AuthSessionRepository,
            useExisting: PrismaAuthSessionRepository,
        },
        ForgotPasswordUseCase,
        LoginUserUseCase,
        LogoutAllUseCase,
        LogoutUseCase,
        RefreshTokenUseCase,
        ResetPasswordUseCase,
        VerifyEmailUseCase,
        CreateUserUseCase,
        PasswordHasher
    ],
    controllers: [
        AuthServiceController
    ],
    exports: [
        AuthModule
    ]
})
export class AuthModule { }