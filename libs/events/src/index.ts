export type EventEnvelope<T> = {
  eventId: string;
  eventType: string;
  occurredAt: string;
  sagaId?: string;
  correlationId?: string;
  payload: T;
};

export const KAFKA_TOPICS = {
  PRODUCT: 'product.events',
  INVENTORY: 'inventory.events',
  SAGA: 'saga.events',
} as const;

export const PRODUCT_EVENTS = {
  CREATED: 'product.created',
  UPDATED: 'product.updated',
  DELETED: 'product.deleted',
  CREATION_FAILED: 'product.creation.failed',
} as const;

export const INVENTORY_EVENTS = {
  INITIALIZED: 'inventory.initialized',
  INITIALIZATION_FAILED: 'inventory.initialization.failed',
  RESERVED: 'inventory.reserved',
  RELEASED: 'inventory.released',
  CONFIRMED: 'inventory.confirmed',
} as const;

export const SAGA_EVENTS = {
  PRODUCT_CREATE_STARTED: 'saga.product.create.started',
  PRODUCT_CREATE_COMPLETED: 'saga.product.create.completed',
  PRODUCT_CREATE_FAILED: 'saga.product.create.failed',
} as const;

export type ProductCreatedPayload = {
  productId: string;
  sku: string;
  name: string;
  price: string;
  currency: string;
  initialQuantity: number;
};

export type InventoryInitializedPayload = {
  productId: string;
  quantity: number;
};

export type InventoryInitializationFailedPayload = {
  productId: string;
  reason: string;
};

export type SagaProductCreateStartedPayload = {
  productId: string;
  initialQuantity: number;
};

export type SagaProductCreateCompletedPayload = {
  productId: string;
};

export type SagaProductCreateFailedPayload = {
  productId: string;
  step: 'product-created' | 'inventory-initialization';
  reason: string;
};
