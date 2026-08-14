export interface CreateAuthSessionData {
    userId: string;
    tokenHash: string;
    family: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
}

export interface PrismaAuthSession {
    id: string;
    userId: string;
    tokenHash: string;
    family: string;
    replacedTokenHash: string | null;
    revokedAt: Date | null;
    revocationReason: any | null; 
    expiresAt: Date;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
}
