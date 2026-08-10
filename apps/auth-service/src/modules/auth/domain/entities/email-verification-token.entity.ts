import { UserEntity } from "../../../users/domain/entities/user.entity";

export class EmailVerificationTokenEntity {
    id: string;
    userId: string;
    user?: UserEntity;
    tokenHash: string;
    expiresAt: Date;
    usedAt: Date | null;
    createdAt: Date;

    constructor(id: string, userId: string, tokenHash: string, expiresAt: Date, usedAt: Date | null, createdAt: Date, user?: UserEntity) {
        this.id = id;
        this.userId = userId;
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
        this.usedAt = usedAt;
        this.createdAt = createdAt;
        if (user) {
            this.user = user;
        }
    }
}