
export class PasswordResetTokenEntity {
    constructor(
        public readonly userId: string,
        public readonly tokenHash: string,
        public readonly expiresAt: Date,
    ) { }

    isExpired(): boolean {
        return this.expiresAt.getTime() <= Date.now();
    }
}