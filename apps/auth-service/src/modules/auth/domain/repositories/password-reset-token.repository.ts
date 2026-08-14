import { PasswordResetTokenEntity } from "../entities/password-reset-token.entity";
import { CreatePasswordResetTokenData } from "../types/password-reset-token.types";

export abstract class PasswordResetTokenRepository {
    abstract create(
        data: CreatePasswordResetTokenData,
    ): Promise<PasswordResetTokenEntity>;

    abstract findByToken(
        tokenHash: string,
    ): Promise<PasswordResetTokenEntity | null>;

    abstract delete(
        id: string,
    ): Promise<void>;
}