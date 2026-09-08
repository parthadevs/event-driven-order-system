/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Kafka,
  Producer,
  Consumer,
  EachMessagePayload,
  logLevel,
  CompressionTypes,
} from 'kafkajs';
import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import type {
  KafkaIncomingMessage,
  KafkaModuleOptions,
  KafkaOutgoingMessage,
} from './kafka.types';
import { KAFKA_MODULE_OPTIONS } from './kafka.types';

@Injectable()
export class KafkaClientService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaClientService.name);
  private readonly kafka: Kafka;
  private producer: Producer | null = null;
  private readonly consumers: Consumer[] = [];

  constructor(
    @Inject(KAFKA_MODULE_OPTIONS) private readonly options: KafkaModuleOptions,
  ) {
    this.kafka = new Kafka({
      clientId: options.clientId,
      brokers: options.brokers,
      logLevel: logLevel.WARN,
      retry: { initialRetryTime: 300, retries: 8 },
    });
  }

  async onModuleInit(): Promise<void> {
    this.producer = this.kafka.producer({ allowAutoTopicCreation: true });
    await this.producer.connect();
    this.logger.log(
      `Kafka producer connected to ${this.options.brokers.join(',')}`,
    );
  }

  async onModuleDestroy(): Promise<void> {
    if (this.producer) {
      await this.producer
        .disconnect()
        .catch((err) =>
          this.logger.error(`Producer disconnect failed: ${err.message}`),
        );
    }
    for (const consumer of this.consumers) {
      await consumer
        .disconnect()
        .catch((err) =>
          this.logger.error(`Consumer disconnect failed: ${err.message}`),
        );
    }
  }

  async publish(
    topic: string,
    messages: KafkaOutgoingMessage[],
  ): Promise<void> {
    if (!this.producer) {
      throw new Error('Kafka producer is not initialized');
    }
    await this.producer.send({
      topic,
      compression: CompressionTypes.None,
      messages: messages.map((m) => ({
        key: m.key,
        value: m.value,
        headers: m.headers,
      })),
    });
  }

  async consume(
    topic: string | string[],
    groupId: string,
    handler: (msg: KafkaIncomingMessage) => Promise<void>,
    fromBeginning = false,
  ): Promise<void> {
    const consumer = this.kafka.consumer({ groupId });
    await consumer.connect();
    const topics = Array.isArray(topic) ? topic : [topic];
    for (const t of topics) {
      await consumer.subscribe({ topic: t, fromBeginning });
    }

    await consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        const value = payload.message.value
          ? safeJsonParse(payload.message.value.toString())
          : null;
        const headers: Record<string, string> = {};
        for (const [k, v] of Object.entries(payload.message.headers ?? {})) {
          if (Buffer.isBuffer(v)) headers[k] = v.toString();
          else if (typeof v === 'string') headers[k] = v;
        }

        try {
          await handler({
            topic: payload.topic,
            partition: payload.partition,
            offset: payload.message.offset,
            key: payload.message.key ? payload.message.key.toString() : null,
            value,
            headers,
            timestamp: payload.message.timestamp,
          });
        } catch (err) {
          this.logger.error(
            `Consumer handler error for ${payload.topic}@${payload.partition}:${payload.message.offset}: ${(err as Error).message}`,
          );
        }
      },
    });

    this.consumers.push(consumer);
    this.logger.log(
      `Kafka consumer subscribed to [${topics.join(',')}] group=${groupId}`,
    );
  }
}

function safeJsonParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}
