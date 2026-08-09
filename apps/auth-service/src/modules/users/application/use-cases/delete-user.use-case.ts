import { Injectable } from "@nestjs/common";
import { PrismaUserRepository } from "../../infrastructure/persistence/prisma-user.repository";

@Injectable()
export class DeleteUserUseCase {
    constructor(
        private readonly userRepository: PrismaUserRepository,
    ) { }

    async execute(id: string) {
        throw new Error("Method not implemented.");
    }
}