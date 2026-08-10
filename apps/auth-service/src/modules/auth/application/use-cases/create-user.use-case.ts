import { Injectable, Logger } from "@nestjs/common";
import { RegisterDto } from "../dto/register.dto";
import { UserRepository } from "../../../users/domain/repositories/user.repository";

@Injectable()
export class CreateUserUseCase {
    private readonly log = new Logger(CreateUserUseCase.name)

    constructor(
        private readonly userRepository: UserRepository,

    ) { }

    async execute(input: RegisterDto) {

        return {
            success: true,
            code: 201,
            message: "User created successfully",
            data: input
        };
    }
}