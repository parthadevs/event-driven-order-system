import { Module } from "@nestjs/common";
import { DeleteUserUseCase } from "./application/use-cases/delete-user.use-case";
import { GetUserUseCase } from "./application/use-cases/get-user.use-case";
import { UpdateUserUseCase } from "./application/use-cases/update-user.use-case";
import { UsersController } from "./presentation/controllers/users.controller";
import { UserRepository } from "./domain/repositories/user.repository";
import { PrismaUserRepository } from "./infrastructure/persistence/prisma-user.repository";
import { PrismaModule } from "../../infrastructure/persistence/prisma/prisma.module";

@Module({
    imports: [PrismaModule],
    controllers: [
        UsersController
    ],
    providers: [
        {
            provide: UserRepository,
            useClass: PrismaUserRepository,
        },
        DeleteUserUseCase,
        GetUserUseCase,
        UpdateUserUseCase,
        UsersController
    ],
    exports: [
        UserRepository
    ]
})
export class UsersModule { }