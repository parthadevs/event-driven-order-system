import * as bcrypt from "bcrypt";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PasswordHasher {
    private readonly DEFAULT_SALT_ROUNDS = 10;

    async hashPassword(password: string, saltRounds: number = this.DEFAULT_SALT_ROUNDS): Promise<string> {
        return bcrypt.hash(password, saltRounds);
    }

    async comparePassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }
}