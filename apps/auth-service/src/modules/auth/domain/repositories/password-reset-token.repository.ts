import { PasswordResetTokenEntity } from "../entities/password-reset-token.entity";

export abstract class PasswordResetTokenRepository {
    abstract create(token: PasswordResetTokenEntity): Promise<PasswordResetTokenEntity>;
    abstract findByTokenHash(tokenHash: string): Promise<PasswordResetTokenEntity | null>;
    abstract findByUserId(userId: string): Promise<PasswordResetTokenEntity | null>;
    abstract deleteByUserId(userId: string): Promise<void>;
    abstract deleteExpired(): Promise<void>;
    abstract markAsUsed(id: string): Promise<void>;
    abstract deleteById(id: string): Promise<void>;
}