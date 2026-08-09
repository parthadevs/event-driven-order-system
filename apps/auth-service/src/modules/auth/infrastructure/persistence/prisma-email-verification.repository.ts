// auth/infrastructure/persistence/prisma-email-verification.repository.ts

import { Injectable } from '@nestjs/common';

import { EmailVerificationTokenRepository } from '../../domain/repositories/email-verification-token.repository';
import { EmailVerificationTokenEntity } from '../../domain/entities/email-verification-token.entity';
import { PrismaService } from 'apps/auth-service/src/infrastructure/persistence/prisma/prisma.service';

@Injectable()
export class PrismaEmailVerificationRepository
    implements EmailVerificationTokenRepository {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async create(
        token: EmailVerificationTokenEntity,
    ): Promise<EmailVerificationTokenEntity> {
        const record = await this.prisma.emailVerificationToken.create({
            data: {
                id: token.id,
                userId: token.userId,
                tokenHash: token.tokenHash,
                expiresAt: token.expiresAt,
                usedAt: token.usedAt,
                createdAt: token.createdAt,
            },
        });

        return this.toDomain(record);
    }

    async findByTokenHash(
        tokenHash: string,
    ): Promise<EmailVerificationTokenEntity | null> {
        const record =
            await this.prisma.emailVerificationToken.findUnique({
                where: {
                    tokenHash,
                },
            });

        if (!record) {
            return null;
        }

        return this.toDomain(record);
    }

    async markAsUsed(id: string): Promise<void> {
        await this.prisma.emailVerificationToken.update({
            where: {
                id,
            },
            data: {
                usedAt: new Date(),
            },
        });
    }

    async deleteExpired(): Promise<void> {
        await this.prisma.emailVerificationToken.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });
    }

    private toDomain(record: {
        id: string;
        userId: string;
        tokenHash: string;
        usedAt: Date | null;
        expiresAt: Date;
        createdAt: Date;
    }): EmailVerificationTokenEntity {
        return new EmailVerificationTokenEntity(
            record.id,
            record.userId,
            record.tokenHash,
            record.expiresAt,
            record.usedAt,
            record.createdAt,
        );
    }
}