export interface JwtPayload {
    sub: string;
    email: string;
    role?: string;
    [key: string]: any;
}

export interface TokenGenerationOptions {
    expiresIn?: string | number;
    secret?: string;
}
