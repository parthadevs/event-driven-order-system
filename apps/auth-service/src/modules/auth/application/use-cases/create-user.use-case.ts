import { Injectable, Logger } from "@nestjs/common";
import { RegisterDto } from "../dto/register.dto";
import { PrismaUserRepository } from "../../../users/infrastructure/persistence/prisma-user.repository";
import { PasswordHasher } from "../../../../security/password/password-hasher";
import { ConflictException } from "@nestjs/common";
import { UserEntity } from "../../../users/domain/entities/user.entity";

@Injectable()
export class CreateUserUseCase {
    private readonly log = new Logger(CreateUserUseCase.name)

    constructor(
        private readonly userRepository: PrismaUserRepository,
        private readonly passwordHasher: PasswordHasher,
    ) { }

    async execute(input: RegisterDto) {

        const existingUser = await this.userRepository.findByEmail(input.email);
        if (existingUser) {
            throw new ConflictException("User already exists with this email");
        }
        const hashedPassword = await this.passwordHasher.hashPassword(input.password);

        const userToCreate = new UserEntity({
            email: input.email,
            passwordHash: hashedPassword,
            firstName: input.firstName,
            lastName: input.lastName,
        });

        const user = await this.userRepository.create(userToCreate);

        this.log.log(`User created successfully with ID: ${user.id}`);

        return {
            success: true,
            code: 201,
            message: "User created successfully",
            data: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                createdAt: user.createdAt,
            }
        };
    }
}