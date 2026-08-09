import { UserEntity } from "../../../users/domain/entities/user.entity";

type AuthEventType =
    "LOGIN_SUCCESS" |
    "LOGIN_FAILED" |
    "LOGOUT" |
    "REFRESH_TOKEN_CREATED" |
    "REFRESH_TOKEN_ROTATED" |
    "REFRESH_TOKEN_REUSED" |
    "REFRESH_TOKEN_REVOKED" |
    "PASSWORD_CHANGED" |
    "PASSWORD_RESET_REQUESTED" |
    "PASSWORD_RESET_COMPLETED" |
    "EMAIL_VERIFICATION_REQUESTED" |
    "EMAIL_VERIFIED" |
    "ACCOUNT_CREATED" |
    "ACCOUNT_SUSPENDED" |
    "ACCOUNT_REACTIVATED" |
    "OAUTH_LOGIN" |
    "OAUTH_ACCOUNT_LINKED" |
    "OAUTH_ACCOUNT_UNLINKED";

export class AuthEventEntity {
    id: string;
    userId: string;
    user: UserEntity;
    type: AuthEventType;
    ipAddress: string;
    userAgent: string;
    metadata: object;
    createdAt: Date;

    constructor(id: string, userId: string, user: UserEntity, type: AuthEventType, ipAddress: string, userAgent: string, metadata: object, createdAt: Date) {
        this.id = id;
        this.userId = userId;
        this.user = user;
        this.type = type;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.metadata = metadata;
        this.createdAt = createdAt;
    }
}