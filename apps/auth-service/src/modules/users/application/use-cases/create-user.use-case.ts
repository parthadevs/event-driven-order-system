import { Injectable } from "@nestjs/common";
import { RegisterDto } from "../dto/register.dto";
import { PrismaUserRepository } from "../../infrastructure/persistence/prisma-user.repository";

@Injectable()
export class CreateUserUseCase {
    constructor(
        private readonly userRepository: PrismaUserRepository,
    ) { }

    async execute(input: RegisterDto) {
        throw new Error("Method not implemented.");
    }
}