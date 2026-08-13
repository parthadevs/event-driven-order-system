import { Injectable } from "@nestjs/common";
import { UserRepository } from "../../domain/repositories/user.repository";
import { PrismaService } from "apps/auth-service/src/infrastructure/persistence/prisma/prisma.service";
import { UserEntity } from "../../domain/entities/user.entity";

@Injectable()
export class PrismaUserRepository implements UserRepository {

    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async create(user: UserEntity): Promise<UserEntity> {
        const newUser = await this.prisma.user.create({
            data: {
                id: user.id,
                email: user.email,
                passwordHash: user.passwordHash,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role as any,
                status: user.status as any,
            },
        });
        return new UserEntity(newUser as any);
    }

    async findById(id: string): Promise<UserEntity | null> {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) return null;
        return new UserEntity(user as any);
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        return new UserEntity(user as any);
    }

    async createPasswordResetToken(token: string, userId: string, expiresIn: string): Promise<void> {
        const expiresInMinutes = parseInt(expiresIn, 10);
        const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

        await this.prisma.passwordResetToken.create({
            data: {
                tokenHash: token,
                userId: userId,
                expiresAt: expiresAt,
            },
        });
    }

    async findPasswordResetToken(token: string): Promise<any | null> {
        return this.prisma.passwordResetToken.findUnique({ where: { tokenHash: token } });
    }

    async update(user: UserEntity): Promise<UserEntity> {
        const updatedUser = await this.prisma.user.update({
            where: { id: user.id },
            data: {
                email: user.email,
                passwordHash: user.passwordHash,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role as any,
                status: user.status as any,
                failedLoginAttempts: user.failedLoginAttempts,
                lockedUntil: user.lockedUntil,
                lastLoginAt: user.lastLoginAt,
                lastLoginIp: user.lastLoginIp,
                passwordChangedAt: user.passwordChangedAt,
            },
        });
        return new UserEntity(updatedUser as any);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.user.delete({ where: { id } });
    }
}