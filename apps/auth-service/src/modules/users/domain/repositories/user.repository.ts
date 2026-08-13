import { Injectable } from "@nestjs/common";
import { UserEntity } from "../entities/user.entity";

@Injectable()
export abstract class UserRepository {
    abstract findByEmail(email: string): Promise<UserEntity | null>;
    abstract findById(id: string): Promise<UserEntity | null>;
    abstract create(user: UserEntity): Promise<UserEntity>;
    abstract update(user: UserEntity): Promise<UserEntity>;
    abstract delete(id: string): Promise<void>;
    abstract createPasswordResetToken(token: string, userId: string, expiresIn: string): Promise<void>;
    abstract findPasswordResetToken(token: string): Promise<any | null>;
}