import { EmailVerificationTokenEntity } from '../entities/email-verification-token.entity';

export abstract class EmailVerificationTokenRepository {
    abstract create(token: EmailVerificationTokenEntity): Promise<EmailVerificationTokenEntity>;
    abstract findByTokenHash(tokenHash: string): Promise<EmailVerificationTokenEntity | null>;
    abstract markAsUsed(id: string): Promise<void>;
    abstract deleteExpired(): Promise<void>;
}