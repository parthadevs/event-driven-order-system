import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { ForgotPasswordUseCase } from "./application/use-cases/forgot-password.use-case";
import { LoginUserUseCase } from "./application/use-cases/login-user.use-case";
import { LogoutAllUseCase } from "./application/use-cases/logout-all.use-case";
import { LogoutUseCase } from "./application/use-cases/logout.use-case";
import { RefreshTokenUseCase } from "./application/use-cases/refresh-token.use-case";
import { ResetPasswordUseCase } from "./application/use-cases/reset-password.use-case";
import { VerifyEmailUseCase } from "./application/use-cases/verify-email.use-case";
import { AuthServiceController } from "./presentation/controllers/auth.controller";
import { CreateUserUseCase } from "./application/use-cases/create-user.use-case";


@Module({
    providers: [
        ForgotPasswordUseCase,
        LoginUserUseCase,
        LogoutAllUseCase,
        LogoutUseCase,
        RefreshTokenUseCase,
        ResetPasswordUseCase,
        VerifyEmailUseCase,
        CreateUserUseCase,
    ],
    controllers: [
        AuthServiceController
    ],
    exports: [
        AuthModule
    ]
})
export class AuthModule { }