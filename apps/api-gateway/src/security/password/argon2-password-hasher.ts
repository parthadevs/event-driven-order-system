import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PasswordHasher } from './password-hasher';

@Injectable()
export class Argon2PasswordHasher implements PasswordHasher {
    async hash(password: string): Promise<string> {
        try {
            return await argon2.hash(password);
        } catch (error) {
            throw new InternalServerErrorException('Error hashing password');
        }
    }

    async verify(password: string, hash: string): Promise<boolean> {
        try {
            return await argon2.verify(hash, password);
        } catch (error) {
            throw new InternalServerErrorException('Error verifying password');
        }
    }
}