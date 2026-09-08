import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { KafkaClientService } from '@repo/kafka';
import { SagaOrchestrator } from './saga.orchestrator';
import {
  EventEnvelope,
  KAFKA_TOPICS,
  SAGA_EVENTS,
  SagaProductCreateCompletedPayload,
  SagaProductCreateFailedPayload,
} from '@repo/events';

/**
 * Subscribes the product-service to saga replies emitted by inventory-service.
 * (Inventory publishes `saga.product.create.completed` / `saga.product.create.failed`
 * on the SAGA topic.)
 */
@Injectable()
export class SagaReplyConsumer implements OnModuleInit {
  private readonly logger = new Logger(SagaReplyConsumer.name);

  constructor(
    private readonly kafka: KafkaClientService,
    private readonly orchestrator: SagaOrchestrator,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.kafka.consume(
      KAFKA_TOPICS.SAGA,
      'product-service-saga-replies',
      async (message) => {
        const envelope = message.value as EventEnvelope<unknown> | null;
        if (!envelope || typeof envelope !== 'object' || !envelope.eventType) {
          return;
        }

        const sagaId = envelope.sagaId;
        if (!sagaId) {
          this.logger.warn(`Saga reply missing sagaId on ${message.topic}`);
          return;
        }

        if (envelope.eventType === SAGA_EVENTS.PRODUCT_CREATE_COMPLETED) {
          await this.orchestrator.onInventoryInitialized(
            sagaId,
            envelope.payload as SagaProductCreateCompletedPayload,
          );
          return;
        }

        if (envelope.eventType === SAGA_EVENTS.PRODUCT_CREATE_FAILED) {
          await this.orchestrator.onInventoryInitializationFailed(
            sagaId,
            envelope.payload as SagaProductCreateFailedPayload,
          );
          return;
        }
      },
    );
  }
}
