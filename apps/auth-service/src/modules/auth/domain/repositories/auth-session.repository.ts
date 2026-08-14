import { AuthSessionEntity } from "../entities/auth-session.entity";
import { CreateAuthSessionData } from "../types/auth-session.types";

export abstract class AuthSessionRepository {
    abstract create(data: CreateAuthSessionData): Promise<AuthSessionEntity>;
    abstract update(authSession: AuthSessionEntity): Promise<AuthSessionEntity>;
    abstract delete(id: string): Promise<void>;
    abstract findById(id: string): Promise<AuthSessionEntity | null>;
    abstract findAll(): Promise<AuthSessionEntity[]>;
    abstract findByTokenHash(tokenHash: string): Promise<AuthSessionEntity | null>;
    abstract findByFamily(family: string): Promise<AuthSessionEntity[]>;
}