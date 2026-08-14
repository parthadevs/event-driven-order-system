export interface PrismaPasswordResetToken {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    usedAt: Date | null;
    createdAt: Date;
}

export interface CreatePasswordResetTokenData {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
}