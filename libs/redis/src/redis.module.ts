import { Global, Logger, Module } from "@nestjs/common";
import { Redis } from "ioredis";
import { ConfigModule, ConfigService } from "@app/config";
import { REDIS_CLIENT } from "./redis.constants";
import { RedisService } from "./redis.service";

@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: REDIS_CLIENT,
            useFactory: (configService: ConfigService) => {
                const logger = new Logger('RedisClient');
                
                const redis = new Redis({
                    host: configService.get('REDIS_HOST'),
                    port: Number(configService.get('REDIS_PORT')) || 6379,
                    password: configService.get('REDIS_PASSWORD'),
                    // Production-grade retry strategy
                    retryStrategy(times) {
                        const delay = Math.min(times * 50, 2000);
                        return delay;
                    },
                    maxRetriesPerRequest: 3,
                });

                redis.on('error', (err) => {
                    logger.error('Redis Client Error', err);
                });

                redis.on('connect', () => {
                    logger.log('Successfully connected to Redis');
                });

                return redis;
            },
            inject: [ConfigService],
        },
        RedisService,
    ],
    exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule { }