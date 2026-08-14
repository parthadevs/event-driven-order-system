import { ConflictException, Injectable, Logger } from "@nestjs/common";
import { UserRepository } from "@auth-service/modules/users/domain/repositories/user.repository";
import { PasswordHasher } from "@auth-service/security/password/password-hasher";
import { UserEntity } from "@auth-service/modules/users/domain/entities/user.entity";
import { RegisterUserOutput } from "@auth-service/modules/auth/application/types/register.types";
import { RegisterDto } from "@auth-service/modules/auth/application/dto/register.dto";
import { ApiResponse } from "@shared/types/api.types";

@Injectable()
export class CreateUserUseCase {
    private readonly log = new Logger(CreateUserUseCase.name)

    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordHasher: PasswordHasher,
    ) { }

    async execute(input: RegisterDto): Promise<ApiResponse<RegisterUserOutput>> {

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
            timestamp: new Date().toISOString(),
            data: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                status: user.status,
                createdAt: user.createdAt.toISOString(),
            }
        };
    }
}
