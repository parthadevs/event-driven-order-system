import { AuthSessionEntity } from "../entities/auth-session.entity";
import { PrismaAuthSession } from "../types/auth-session.types";

export class AuthSessionMapper {
    static toDomain(data: PrismaAuthSession): AuthSessionEntity {
        return new AuthSessionEntity(
            data.id,
            data.userId,
            null as any, // UserEntity is typically not loaded fully here, or handled separately
            data.tokenHash,
            data.family,
            data.replacedTokenHash as string,
            data.revokedAt as Date,
            data.revocationReason,
            data.expiresAt,
            data.userAgent as string,
            data.ipAddress as string,
            data.createdAt,
        );
    }
}
