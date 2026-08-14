import { PasswordResetTokenEntity } from "@auth-service/modules/auth/domain/entities/password-reset-token.entity";
import { CreatePasswordResetTokenData } from "@auth-service/modules/auth/domain/types/password-reset-token.types";

export class PasswordResetTokenMapper {

    static toDomain(data: CreatePasswordResetTokenData): PasswordResetTokenEntity {
        return new PasswordResetTokenEntity(
            data.userId,
            data.tokenHash,
            data.expiresAt,
        );
    }

    static toPersistence(entity: PasswordResetTokenEntity) {
        return {
            userId: entity.userId,
            tokenHash: entity.tokenHash,
            expiresAt: entity.expiresAt,
        };
    }
}