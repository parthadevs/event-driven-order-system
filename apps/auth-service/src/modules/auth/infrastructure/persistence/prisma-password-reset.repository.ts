import { Injectable } from "@nestjs/common";
import { PasswordResetTokenRepository } from "../../domain/repositories/password-reset-token.repository";
import { PrismaService } from "apps/auth-service/src/infrastructure/persistence/prisma/prisma.service";
import { PasswordResetTokenEntity } from "../../domain/entities/password-reset-token.entity";

@Injectable()
export class PrismaPasswordResetRepository implements PasswordResetTokenRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(token: PasswordResetTokenEntity): Promise<PasswordResetTokenEntity> {
        throw new Error("Method not implemented.");
    }

    async findByTokenHash(tokenHash: string): Promise<PasswordResetTokenEntity | null> {
        throw new Error("Method not implemented.");
    }

    async findByUserId(userId: string): Promise<PasswordResetTokenEntity | null> {
        throw new Error("Method not implemented.");
    }

    async deleteByUserId(userId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async deleteExpired(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async markAsUsed(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async deleteById(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}