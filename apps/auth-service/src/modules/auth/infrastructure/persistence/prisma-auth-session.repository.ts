import { Injectable } from "@nestjs/common";
import { AuthSessionRepository } from "../../domain/repositories/auth-session.repository";
import { AuthSessionEntity } from "../../domain/entities/auth-session.entity";
import { PrismaService } from "../../../../infrastructure/persistence/prisma/prisma.service";
import { CreateAuthSessionData } from "../../domain/types/auth-session.types";
import { AuthSessionMapper } from "../../domain/mapper/auth-session.mapper";

@Injectable()
export class PrismaAuthSessionRepository implements AuthSessionRepository {

    constructor(private readonly prisma: PrismaService) { }

    async create(data: CreateAuthSessionData): Promise<AuthSessionEntity> {
        const authSession = await this.prisma.authSession.create({
            data: {
                userId: data.userId,
                tokenHash: data.tokenHash,
                family: data.family,
                expiresAt: data.expiresAt,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
            }
        });

        return AuthSessionMapper.toDomain(authSession as any);
    }

    async update(authSession: AuthSessionEntity): Promise<AuthSessionEntity> {
        throw new Error("Method not implemented.");
    }

    async delete(id: string): Promise<void> {
        await this.prisma.authSession.delete({ where: { id } });
    }

    async findById(id: string): Promise<AuthSessionEntity | null> {
        throw new Error("Method not implemented.");
    }

    async findAll(): Promise<AuthSessionEntity[]> {
        throw new Error("Method not implemented.");
    }

    async findByTokenHash(tokenHash: string): Promise<AuthSessionEntity | null> {
        const session = await this.prisma.authSession.findUnique({
            where: { tokenHash }
        });
        
        if (!session) return null;
        return AuthSessionMapper.toDomain(session as any);
    }

    async findByFamily(family: string): Promise<AuthSessionEntity[]> {
        throw new Error("Method not implemented.");
    }
}