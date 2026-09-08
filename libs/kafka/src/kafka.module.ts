import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@app/config';
import { KafkaClientService } from './kafka-client.service';
import { KAFKA_MODULE_OPTIONS, KafkaModuleOptions } from './kafka.types';

@Global()
@Module({})
export class KafkaModule {
  static register(options?: {
    clientId?: string;
    brokers?: string[];
    groupId?: string;
  }): DynamicModule {
    return {
      module: KafkaModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: KAFKA_MODULE_OPTIONS,
          useFactory: (config: ConfigService): KafkaModuleOptions => {
            const brokers =
              options?.brokers ??
              (config.get<string>('KAFKA_BROKERS')
                ? config.get<string>('KAFKA_BROKERS').split(',')
                : [config.get<string>('KAFKA_BROKER') ?? 'localhost:9092']);
            const clientId =
              options?.clientId ??
              config.get<string>('KAFKA_CLIENT_ID') ??
              'event-driven-order-system';
            const groupId =
              options?.groupId ??
              config.get<string>('KAFKA_GROUP_ID') ??
              clientId;
            return { brokers, clientId, groupId };
          },
          inject: [ConfigService],
        },
        KafkaClientService,
      ],
      exports: [KafkaClientService],
    };
  }
}
