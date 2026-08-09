import { UserEntity } from "../../../users/domain/entities/user.entity";

export class EmailVerificationTokenEntity {
    id: string;
    userId: string;
    user: UserEntity;
    tokenHash: string;
    expiresAt: Date;
    usedAt: Date | null;
    createdAt: Date;

    constructor(id: string, userId: string, user: UserEntity, tokenHash: string, expiresAt: Date, usedAt: Date, createdAt: Date) {
        this.id = id;
        this.userId = userId;
        this.user = user;
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
        this.usedAt = usedAt;
        this.createdAt = createdAt;
    }
}