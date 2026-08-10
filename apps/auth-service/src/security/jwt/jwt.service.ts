import { JwtPayload, TokenGenerationOptions } from './jwt.types';

export abstract class JwtService {
    abstract generateToken(payload: JwtPayload, options?: TokenGenerationOptions): Promise<string>;
    abstract verifyToken<T extends JwtPayload = JwtPayload>(token: string, secret?: string): Promise<T>;
    abstract decodeToken<T extends JwtPayload = JwtPayload>(token: string): T | null;
}
