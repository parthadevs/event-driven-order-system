export const KAFKA_MODULE_OPTIONS = 'KAFKA_MODULE_OPTIONS';
export const KAFKA_PRODUCER = 'KAFKA_PRODUCER';
export const KAFKA_CONSUMER = 'KAFKA_CONSUMER';

export interface KafkaModuleOptions {
  clientId: string;
  brokers: string[];
  groupId: string;
}

export interface KafkaProducerOptions {
  topic: string;
  messages: KafkaOutgoingMessage[];
}

export interface KafkaOutgoingMessage {
  key?: string;
  value: string;
  headers?: Record<string, string>;
}

export interface KafkaConsumerOptions {
  topic: string | string[];
  groupId?: string;
  fromBeginning?: boolean;
  eachMessage?: (payload: KafkaIncomingMessage) => Promise<void>;
  eachBatch?: (payload: KafkaBatchPayload) => Promise<void>;
}

export interface KafkaIncomingMessage {
  topic: string;
  partition: number;
  offset: string;
  key: string | null;
  value: unknown;
  headers: Record<string, string>;
  timestamp: string;
}

export interface KafkaBatchPayload {
  topic: string;
  partition: number;
  messages: KafkaIncomingMessage[];
}
