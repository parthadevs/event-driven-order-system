import { Injectable } from "@nestjs/common";
import { UserRepository } from "../../domain/repositories/user.repository";
import { PrismaService } from "apps/auth-service/src/infrastructure/persistence/prisma/prisma.service";
import { UserEntity } from "../../domain/entities/user.entity";

@Injectable()
export class PrismaUserRepository implements UserRepository {

    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async create(user: UserEntity): Promise<UserEntity> {
        throw new Error("Method not implemented.");
    }

    async findById(id: string): Promise<UserEntity | null> {
        throw new Error("Method not implemented.");
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        throw new Error("Method not implemented.");
    }

    async update(user: UserEntity): Promise<UserEntity> {
        throw new Error("Method not implemented.");
    }

    async delete(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}