import { Injectable, Logger } from "@nestjs/common";
import { UserRepository } from "@auth-service/modules/users/domain/repositories/user.repository";
import { PrismaService } from "@auth-service/infrastructure/persistence/prisma/prisma.service";
import { UserEntity } from "@auth-service/modules/users/domain/entities/user.entity";
import { UserMapper } from "@auth-service/modules/users/domain/mappers/user.mapper";

@Injectable()
export class PrismaUserRepository implements UserRepository {
    private readonly logger = new Logger(PrismaUserRepository.name);

    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async create(user: UserEntity): Promise<UserEntity> {
        const rawData = UserMapper.toPersistence(user);
        const newUser = await this.prisma.user.create({
            data: rawData,
        });

        return UserMapper.toDomain(newUser);
    }

    async findById(id: string): Promise<UserEntity | null> {
        // ১. আগে Redis Cache চেক করা উচিত (Pseudo-code):
        // const cachedUser = await this.redis.get(`user:${id}`);
        // if (cachedUser) return UserMapper.toDomain(JSON.parse(cachedUser));

        // ২. ডাটাবেজ ফিল্টারিং (শুধুমাত্র প্রয়োজনীয় ফিল্ড Select করা স্কেলে ভালো)
        const user = await this.prisma.user.findFirst({
            where: {
                id,
                status: { not: "DELETED" } // Soft delete check
            },
        });

        if (!user) return null;

        const userEntity = UserMapper.toDomain(user);
        // await this.redis.set(`user:${id}`, JSON.stringify(userEntity), 'EX', 3600); // 1 Hour Cache

        return userEntity;
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        const user = await this.prisma.user.findFirst({
            where: {
                email: email.toLowerCase().trim(), // Case-insensitive handling
                status: { not: "DELETED" }
            },
        });

        if (!user) return null;
        return UserMapper.toDomain(user);
    }

    async update(user: UserEntity): Promise<UserEntity> {
        const rawData = UserMapper.toPersistence(user);

        const updatedUser = await this.prisma.user.update({
            where: { id: user.id },
            data: rawData,
        });

        // Cache Invalidate / Update
        // await this.redis.del(`user:${user.id}`);

        return UserMapper.toDomain(updatedUser);
    }

    // Soft Delete Implementation
    async delete(id: string): Promise<void> {
        await this.prisma.user.update({
            where: { id },
            data: {
                status: "DELETED" as any,
            },
        });

        // await this.redis.del(`user:${id}`);
    }
}