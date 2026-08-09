import { Injectable } from "@nestjs/common";
import { PrismaUserRepository } from "../../infrastructure/persistence/prisma-user.repository";

@Injectable()
export class UpdateUserUseCase {
    constructor(
        private readonly userRepository: PrismaUserRepository,
    ) { }

    async execute(input: any) {
        throw new Error("Method not implemented.");
    }
}