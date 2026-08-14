import { User as PrismaUser } from "@prisma/client";
import { UserEntity } from "../entities/user.entity";
import { UserRole, UserStatus } from "../entities/user.entity";

export class UserMapper {

    static toDomain(prismaUser: PrismaUser): UserEntity {
        return new UserEntity({
            id: prismaUser.id,
            email: prismaUser.email,
            passwordHash: prismaUser.passwordHash ?? undefined,
            firstName: prismaUser.firstName ?? undefined,
            lastName: prismaUser.lastName ?? undefined,
            role: prismaUser.role as UserRole,
            status: prismaUser.status as UserStatus,
            failedLoginAttempts: prismaUser.failedLoginAttempts,
            lockedUntil: prismaUser.lockedUntil ?? undefined,
            lastLoginAt: prismaUser.lastLoginAt ?? undefined,
            lastLoginIp: prismaUser.lastLoginIp ?? undefined,
            passwordChangedAt: prismaUser.passwordChangedAt ?? undefined,
            createdAt: prismaUser.createdAt,
            updatedAt: prismaUser.updatedAt,
        });
    }

    static toPersistence(domainUser: UserEntity): any {
        return {
            id: domainUser.id,
            email: domainUser.email.toLowerCase().trim(),
            passwordHash: domainUser.passwordHash,
            firstName: domainUser.firstName,
            lastName: domainUser.lastName,
            role: domainUser.role as UserRole,
            status: domainUser.status as UserStatus,
            failedLoginAttempts: domainUser.failedLoginAttempts,
            lockedUntil: domainUser.lockedUntil,
            lastLoginAt: domainUser.lastLoginAt,
            lastLoginIp: domainUser.lastLoginIp,
            passwordChangedAt: domainUser.passwordChangedAt,
        };
    }

    static toResponseDto(domainUser: UserEntity) {
        return {
            id: domainUser.id,
            email: domainUser.email,
            firstName: domainUser.firstName,
            lastName: domainUser.lastName,
            role: domainUser.role,
            status: domainUser.status,
            createdAt: domainUser.createdAt,
        };
    }
}