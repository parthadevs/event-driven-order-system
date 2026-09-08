/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/require-await */
import { SagaOrchestrator } from './saga.orchestrator';
import {
  KAFKA_TOPICS,
  PRODUCT_EVENTS,
  SAGA_EVENTS,
  SagaProductCreateCompletedPayload,
  SagaProductCreateFailedPayload,
} from '@repo/events';

interface PublishedMessage {
  topic: string;
  messages: { key?: string; value: string; headers?: Record<string, string> }[];
}

class FakeKafkaClient {
  public published: PublishedMessage[] = [];

  async publish(topic: string, messages: any[]): Promise<void> {
    this.published.push({ topic, messages });
  }

  async consume(): Promise<any> {
    /* noop */
  }
}

describe('SagaOrchestrator', () => {
  let orchestrator: SagaOrchestrator;
  let kafka: FakeKafkaClient;

  beforeEach(() => {
    kafka = new FakeKafkaClient();
    orchestrator = new SagaOrchestrator(kafka as unknown as never);
  });

  it('publishes product.created and saga.product.create.started', async () => {
    await orchestrator.startProductCreate({
      productId: 'p-1',
      sku: 'SKU-1',
      initialQuantity: 50,
    });

    expect(kafka.published).toHaveLength(2);

    const productEvt = kafka.published[0];
    expect(productEvt.topic).toBe(KAFKA_TOPICS.PRODUCT);
    const productBody = JSON.parse(productEvt.messages[0].value);
    expect(productBody.eventType).toBe(PRODUCT_EVENTS.CREATED);
    expect(productBody.payload.productId).toBe('p-1');
    expect(productBody.payload.initialQuantity).toBe(50);

    const sagaEvt = kafka.published[1];
    expect(sagaEvt.topic).toBe(KAFKA_TOPICS.SAGA);
    const sagaBody = JSON.parse(sagaEvt.messages[0].value);
    expect(sagaBody.eventType).toBe(SAGA_EVENTS.PRODUCT_CREATE_STARTED);
    expect(sagaBody.payload.productId).toBe('p-1');
    expect(sagaBody.sagaId).toBeDefined();
  });

  it('emits saga.product.create.completed handler is a no-op for unknown saga', async () => {
    await orchestrator.onInventoryInitialized('unknown-saga', {
      productId: 'p-1',
    } satisfies SagaProductCreateCompletedPayload);
    // No events emitted
    expect(kafka.published).toHaveLength(0);
  });

  it('emits product.creation.failed when inventory reports a failure', async () => {
    await orchestrator.startProductCreate({
      productId: 'p-2',
      sku: 'SKU-2',
      initialQuantity: 0,
    });
    const sagaId = JSON.parse(kafka.published[1].messages[0].value).sagaId;

    await orchestrator.onInventoryInitializationFailed(sagaId, {
      productId: 'p-2',
      step: 'inventory-initialization',
      reason: 'db down',
    } satisfies SagaProductCreateFailedPayload);

    expect(kafka.published).toHaveLength(3);
    const failEvt = kafka.published[2];
    expect(failEvt.topic).toBe(KAFKA_TOPICS.PRODUCT);
    const failBody = JSON.parse(failEvt.messages[0].value);
    expect(failBody.eventType).toBe(PRODUCT_EVENTS.CREATION_FAILED);
    expect(failBody.payload.reason).toBe('inventory-initialization: db down');
  });
});
