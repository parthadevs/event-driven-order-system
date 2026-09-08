/* eslint-disable @typescript-eslint/require-await */
import { Injectable, Logger } from '@nestjs/common';
import { newId } from '../domain/utils/id.util';
import { KafkaClientService } from '@repo/kafka';
import {
  KAFKA_TOPICS,
  PRODUCT_EVENTS,
  SAGA_EVENTS,
  ProductCreatedPayload,
  SagaProductCreateCompletedPayload,
  SagaProductCreateFailedPayload,
  SagaProductCreateStartedPayload,
  EventEnvelope,
} from '@repo/events';

export interface StartProductCreateInput {
  productId: string;
  sku: string;
  initialQuantity: number;
}

interface SagaState {
  sagaId: string;
  productId: string;
  step: 'awaiting-inventory-initialization' | 'completed' | 'failed';
  attempts: number;
}

@Injectable()
export class SagaOrchestrator {
  private readonly logger = new Logger(SagaOrchestrator.name);
  private readonly sagas = new Map<string, SagaState>();

  constructor(private readonly kafka: KafkaClientService) {}

  /**
   * Start the product-create saga:
   *   1. emit `product.created` (choreography signal so other listeners can react)
   *   2. emit `saga.product.create.started` (orchestrator command)
   *   3. inventory-service consumes the command, initializes Inventory, replies via
   *      `saga.product.create.completed` or `saga.product.create.failed`
   *   4. on failure → compensating transaction emits `product.creation.failed`
   *      so downstream listeners can clean up.
   */
  async startProductCreate(input: StartProductCreateInput): Promise<void> {
    const sagaId = newId();
    this.sagas.set(sagaId, {
      sagaId,
      productId: input.productId,
      step: 'awaiting-inventory-initialization',
      attempts: 0,
    });

    this.logger.log(
      `Saga ${sagaId} → product-create productId=${input.productId} qty=${input.initialQuantity}`,
    );

    try {
      // 1. Domain event: a product was created
      await this.publish<ProductCreatedPayload>(KAFKA_TOPICS.PRODUCT, {
        eventId: newId(),
        eventType: PRODUCT_EVENTS.CREATED,
        occurredAt: new Date().toISOString(),
        sagaId,
        correlationId: input.productId,
        payload: {
          productId: input.productId,
          sku: input.sku,
          name: '',
          price: '0',
          currency: 'USD',
          initialQuantity: input.initialQuantity,
        },
      });

      // 2. Saga command: ask inventory-service to initialize stock for this product
      await this.publish<SagaProductCreateStartedPayload>(KAFKA_TOPICS.SAGA, {
        eventId: newId(),
        eventType: SAGA_EVENTS.PRODUCT_CREATE_STARTED,
        occurredAt: new Date().toISOString(),
        sagaId,
        correlationId: input.productId,
        payload: {
          productId: input.productId,
          initialQuantity: input.initialQuantity,
        },
      });
    } catch (error) {
      this.logger.error(
        `Saga ${sagaId} publish failed: ${(error as Error).message}`,
      );
      await this.compensate(sagaId, input.productId, 'publish-failed');
      throw error;
    }
  }

  /**
   * Called by the Kafka consumer when inventory-service reports success.
   */
  async onInventoryInitialized(
    sagaId: string,
    payload: SagaProductCreateCompletedPayload,
  ): Promise<void> {
    const saga = this.sagas.get(sagaId);
    if (!saga) {
      this.logger.warn(`Unknown sagaId=${sagaId} for inventory-initialized`);
      return;
    }
    saga.step = 'completed';
    this.logger.log(
      `Saga ${sagaId} completed for productId=${payload.productId}`,
    );
    // No further commands — product + inventory are in sync. Saga state can be GC'd after a TTL.
  }

  /**
   * Called by the Kafka consumer when inventory-service reports a failure.
   * Runs the compensating action: emit a `product.creation.failed` event so any
   * downstream listeners can clean up (e.g. soft-delete the product, mark inactive).
   */
  async onInventoryInitializationFailed(
    sagaId: string,
    payload: SagaProductCreateFailedPayload,
  ): Promise<void> {
    await this.compensate(
      sagaId,
      payload.productId,
      `${payload.step}: ${payload.reason}`,
    );
  }

  private async compensate(
    sagaId: string,
    productId: string,
    reason: string,
  ): Promise<void> {
    const saga = this.sagas.get(sagaId);
    if (saga) saga.step = 'failed';
    this.logger.warn(
      `Saga ${sagaId} compensating productId=${productId} reason=${reason}`,
    );

    await this.publish<{ productId: string; reason: string }>(
      KAFKA_TOPICS.PRODUCT,
      {
        eventId: newId(),
        eventType: PRODUCT_EVENTS.CREATION_FAILED,
        occurredAt: new Date().toISOString(),
        sagaId,
        correlationId: productId,
        payload: { productId, reason },
      },
    );
  }

  private async publish<T>(
    topic: string,
    envelope: EventEnvelope<T>,
  ): Promise<void> {
    await this.kafka.publish(topic, [
      {
        key: envelope.sagaId ?? envelope.correlationId ?? envelope.eventId,
        value: JSON.stringify(envelope),
        headers: {
          'event-type': envelope.eventType,
          ...(envelope.sagaId ? { 'saga-id': envelope.sagaId } : {}),
        },
      },
    ]);
  }
}
