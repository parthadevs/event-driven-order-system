import { Injectable } from "@nestjs/common";
import { PasswordResetTokenEntity } from "@auth-service/modules/auth/domain/entities/password-reset-token.entity";
import { PasswordResetTokenRepository } from "@auth-service/modules/auth/domain/repositories/password-reset-token.repository";
import { CreatePasswordResetTokenData } from "@auth-service/modules/auth/domain/types/password-reset-token.types";
import { PasswordResetTokenMapper } from "@auth-service/modules/auth/domain/mapper/password-reset-token.mapper";
import { PrismaService } from "apps/auth-service/src/infrastructure/persistence/prisma/prisma.service";

@Injectable()
export class PrismaPasswordResetRepository implements PasswordResetTokenRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(
        data: CreatePasswordResetTokenData,
    ): Promise<PasswordResetTokenEntity> {

        const token =
            await this.prisma.passwordResetToken.create({
                data: {
                    userId: data.userId,
                    tokenHash: data.tokenHash,
                    expiresAt: data.expiresAt,
                },
            });

        return PasswordResetTokenMapper.toDomain(token);
    }

    async findByToken(tokenHash: string): Promise<PasswordResetTokenEntity | null> {
        const token = await this.prisma.passwordResetToken.findUnique({
            where: { tokenHash }
        });

        if (!token) {
            return null;
        }

        return PasswordResetTokenMapper.toDomain(token);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.passwordResetToken.delete({
            where: { id }
        });
    }
}