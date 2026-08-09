import { Injectable } from "@nestjs/common";
import { AuthSessionRepository } from "../../domain/repositories/auth-session.repository";
import { AuthSessionEntity } from "../../domain/entities/auth-session.entity";
import { PrismaService } from "../../../../infrastructure/persistence/prisma/prisma.service";

@Injectable()
export class PrismaAuthSessionRepository implements AuthSessionRepository {

    constructor(private readonly prisma: PrismaService) { }

    async create(authSession: AuthSessionEntity): Promise<AuthSessionEntity> {
        throw new Error("Method not implemented.");
    }

    async update(authSession: AuthSessionEntity): Promise<AuthSessionEntity> {
        throw new Error("Method not implemented.");
    }

    async delete(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async findById(id: string): Promise<AuthSessionEntity | null> {
        throw new Error("Method not implemented.");
    }

    async findAll(): Promise<AuthSessionEntity[]> {
        throw new Error("Method not implemented.");
    }

    async findByTokenHash(tokenHash: string): Promise<AuthSessionEntity | null> {
        throw new Error("Method not implemented.");
    }

    async findByFamily(family: string): Promise<AuthSessionEntity[]> {
        throw new Error("Method not implemented.");
    }
}