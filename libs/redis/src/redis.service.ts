import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';
import { RedisSetOptions } from './redis.types';

@Injectable()
export class RedisService implements OnModuleDestroy {
    private readonly logger = new Logger(RedisService.name);

    constructor(
        @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
    ) { }

    onModuleDestroy() {
        this.redisClient.disconnect();
    }

    /**
     * Set a value in Redis
     * @param key Redis key
     * @param value Value to store (objects will be JSON stringified)
     * @param options Additional options like TTL
     */
    async set(key: string, value: any, options?: RedisSetOptions): Promise<'OK' | null> {
        try {
            const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

            if (options?.ttl) {
                return await this.redisClient.set(key, stringValue, 'EX', options.ttl);
            }
            return await this.redisClient.set(key, stringValue);
        } catch (error) {
            this.logger.error(`Error setting key ${key} in Redis`, error);
            throw error;
        }
    }

    /**
     * Get a value from Redis
     * @param key Redis key
     */
    async get<T = any>(key: string): Promise<T | null> {
        try {
            const value = await this.redisClient.get(key);
            if (!value) return null;

            try {
                return JSON.parse(value) as T;
            } catch {
                return value as T; // Return as string if it wasn't JSON
            }
        } catch (error) {
            this.logger.error(`Error getting key ${key} from Redis`, error);
            throw error;
        }
    }

    /**
     * Delete a key from Redis
     * @param key Redis key
     */
    async del(key: string): Promise<number> {
        try {
            return await this.redisClient.del(key);
        } catch (error) {
            this.logger.error(`Error deleting key ${key} from Redis`, error);
            throw error;
        }
    }

    /**
     * Check if a key exists in Redis
     * @param key Redis key
     */
    async exists(key: string) {
        try {
            return this.redisClient.exists(key);
        } catch (error) {
            this.logger.error(`Error checking key ${key} in Redis`, error);
            throw error;
        }
    }

    /**
     * Set a time to live for a key in Redis
     * @param key Redis key
     * @param seconds Time to live in seconds
     */
    async expire(key: string, seconds: number) {
        try {
            return await this.redisClient.expire(key, seconds);
        } catch (error) {
            this.logger.error(`Error setting expiry for key ${key} in Redis`, error);
            throw error;
        }
    }
}