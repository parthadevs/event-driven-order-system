
import { PasswordResetTokenEntity } from "../../../auth/domain/entities/password-reset-token.entity";
import { EmailVerificationTokenEntity } from "../../../auth/domain/entities/email-verification-token.entity";
import { OAuthAccountEntity } from "../../../auth/domain/entities/oauth-account.entity";
import { AuthEventEntity } from "../../../auth/domain/entities/auth-event.entity";
import { AuthSessionEntity } from "../../../auth/domain/entities/auth-session.entity";

enum UserRole {
    CUSTOMER = "CUSTOMER",
    ADMIN = "ADMIN",
    SUPER_ADMIN = "SUPER_ADMIN",
    SUPPORT = "SUPPORT",
}

enum UserStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    LOCKED = "LOCKED",
    PENDING = "PENDING",
}

export class UserEntity {
    id: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;

    role: UserRole;
    status: UserStatus;
    emailVerifiedAt: Date;
    failedLoginAttempts: number;
    lockedUntil: Date;
    lastLoginAt: Date;
    lastLoginIp: string;
    passwordChangedAt: Date;
    authSessions: AuthSessionEntity[];
    passwordResets: PasswordResetTokenEntity[];
    emailVerifications: EmailVerificationTokenEntity[];
    oauthAccounts: OAuthAccountEntity[];
    authEvents: AuthEventEntity[];
    createdAt: Date;
    updatedAt: Date;

    constructor(id: string, email: string, passwordHash: string, firstName: string, lastName: string, role: UserRole, status: UserStatus, emailVerifiedAt: Date, failedLoginAttempts: number, lockedUntil: Date, lastLoginAt: Date, lastLoginIp: string, passwordChangedAt: Date, authSessions: AuthSessionEntity[], passwordResets: PasswordResetTokenEntity[], emailVerifications: EmailVerificationTokenEntity[], oauthAccounts: OAuthAccountEntity[], authEvents: AuthEventEntity[], createdAt: Date, updatedAt: Date) {
        this.id = id;
        this.email = email;
        this.passwordHash = passwordHash;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.status = status;
        this.emailVerifiedAt = emailVerifiedAt;
        this.failedLoginAttempts = failedLoginAttempts;
        this.lockedUntil = lockedUntil;
        this.lastLoginAt = lastLoginAt;
        this.lastLoginIp = lastLoginIp;
        this.passwordChangedAt = passwordChangedAt;
        this.authSessions = authSessions;
        this.passwordResets = passwordResets;
        this.emailVerifications = emailVerifications;
        this.oauthAccounts = oauthAccounts;
        this.authEvents = authEvents;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}