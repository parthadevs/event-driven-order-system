import { UserEntity } from "../../../users/domain/entities/user.entity";

enum RevocationReason {
    LOGOUT = 'LOGOUT',
    ROTATED = 'ROTATED',
    PASSWORD_CHANGED = 'PASSWORD_CHANGED',
    SECURITY_BREACH = 'SECURITY_BREACH',
    ADMIN_REVOKED = 'ADMIN_REVOKED',
    USER_REVOKED = 'USER_REVOKED',
    EXPIRED = 'EXPIRED',
    TOKEN_REUSE_DETECTED = 'TOKEN_REUSE_DETECTED',
    ACCOUNT_SUSPENDED = 'ACCOUNT_SUSPENDED'
}


export class AuthSessionEntity {
    id: string;
    userId: string;
    user: UserEntity;
    tokenHash: string;
    family: string;
    replacedTokenHash: string;
    revokedAt: Date;
    revocationReason: RevocationReason;
    expiresAt: Date;
    ipAddress: string;
    userAgent: string;
    createdAt: Date;

    constructor(id: string, userId: string, user: UserEntity, tokenHash: string, family: string, replacedTokenHash: string, revokedAt: Date, revocationReason: RevocationReason, expiresAt: Date, userAgent: string, ipAddress: string, createdAt: Date) {
        this.id = id;
        this.userId = userId;
        this.user = user;
        this.tokenHash = tokenHash;
        this.family = family;
        this.replacedTokenHash = replacedTokenHash;
        this.revokedAt = revokedAt;
        this.revocationReason = revocationReason;
        this.expiresAt = expiresAt;
        this.userAgent = userAgent;
        this.ipAddress = ipAddress;
        this.createdAt = createdAt;
    }
}