import { UserEntity } from "../../../users/domain/entities/user.entity";

export class OAuthAccountEntity {
    id: string;
    userId: string;
    user: UserEntity;
    provider: string;
    providerAccountId: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;

    constructor(id: string, userId: string, user: UserEntity, provider: string, providerAccountId: string, accessToken: string, refreshToken: string, expiresAt: Date, createdAt: Date, updatedAt: Date) {
        this.id = id;
        this.userId = userId;
        this.user = user;
        this.provider = provider;
        this.providerAccountId = providerAccountId;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresAt = expiresAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}