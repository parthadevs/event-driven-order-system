import { Injectable } from "@nestjs/common";
import { PrismaService } from "apps/auth-service/src/infrastructure/persistence/prisma/prisma.service";
import { OAuthAccountRepository } from "../../domain/repositories/oauth-account.repository";
import { OAuthAccountEntity } from "../../domain/entities/oauth-account.entity";

@Injectable()
export class PrismaOAuthAccountRepository implements OAuthAccountRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(oauthAccount: OAuthAccountEntity): Promise<OAuthAccountEntity> {
        throw new Error("Method not implemented.");
    }

    async findByProviderAndProviderId(provider: string, providerId: string): Promise<OAuthAccountEntity | null> {
        throw new Error("Method not implemented.");
    }

    async findByUserId(userId: string): Promise<OAuthAccountEntity[]> {
        throw new Error("Method not implemented.");
    }

    async delete(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async deleteByFamily(family: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async deleteExpired(): Promise<void> {
        throw new Error("Method not implemented.");
    }
}