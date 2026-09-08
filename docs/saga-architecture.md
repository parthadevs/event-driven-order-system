# Product ↔ Inventory Saga (Orchestration Pattern)

This document describes how creating a product in `product-service` ends up
creating a matching `Inventory` row in `inventory-service` using an **orchestrated
saga** over Kafka.

## Why orchestration?

There are two common saga styles:

| Style | How it works | Pros | Cons |
|---|---|---|---|
| **Choreography** | Each service publishes events; every other service reacts | No central coordinator; loose coupling | Hard to follow the full flow; business logic scattered across services |
| **Orchestration** | A central coordinator (the saga) issues commands and waits for replies | Explicit state machine; clear ownership of the flow | Coordinator is a single point to scale/observe |

We picked **orchestration** because:

1. The product-create flow spans 2 services (product → inventory) and is the only
   cross-service workflow for products today.
2. Compensation logic ("if inventory init fails, what should product do?") is
   easier to reason about when it lives in one place.
3. The same coordinator can be re-used for future flows (update product → adjust
   inventory, delete product → release stock, etc.).

## Topics

All events flow through three Kafka topics declared in
[`libs/events/src/index.ts`](../libs/events/src/index.ts):

| Topic | Producer | Consumers |
|---|---|---|
| `product.events` | product-service | any service that wants product-lifecycle events (search indexer, analytics, …) |
| `inventory.events` | inventory-service | any service that wants stock-lifecycle events |
| `saga.events` | product-service (orchestrator) & inventory-service | the two services that participate in the saga |

> Topics are created automatically by Kafka (`auto.create.topics.enable=true`).

## Event envelope

Every message uses the same envelope:

```ts
type EventEnvelope<T> = {
  eventId: string;        // uuid
  eventType: string;      // see below
  occurredAt: string;     // ISO timestamp
  sagaId?: string;        // present for saga-related events
  correlationId?: string; // typically the productId
  payload: T;
};
```

Headers also carry `event-type` and `saga-id` so consumers can filter without
parsing the body.

## The product-create flow

```
   ┌─────────────────┐  1. POST /products          ┌─────────────────┐
   │  API Gateway    │ ───────────────────────────▶│  product-service │
   └─────────────────┘                              └────────┬────────┘
                                                              │ 2. INSERT Product
                                                              ▼
                                                     [Postgres products]
                                                              │
                                                              │ 3. publish product.created
                                                              ▼
                                                     Kafka: product.events
                                                              │
                                                              │ 4. publish saga.product.create.started
                                                              ▼
                                                     Kafka: saga.events
                                                              │
                                                              │ 5. consumer:
                                                              │    SagaCommandConsumer.onModuleInit
                                                              ▼
                                              ┌──────────────────────────┐
                                              │   inventory-service      │
                                              │   runs InitializeInvUC   │
                                              └────────────┬─────────────┘
                                                           │
                                                           │ 6a. success
                                                           ▼
                                            Kafka: inventory.events
                                            (inventory.initialized)
                                                           │
                                                           │ 6b. reply
                                                           ▼
                                                  Kafka: saga.events
                                            (saga.product.create.completed)
                                                           │
                                                           ▼
                                       product-service SagaOrchestrator.onInventoryInitialized()
                                                           │
                                                           │ (saga completes)
                                                           ▼
                                                   Done ✓
```

If step 6a fails (DB down, validation error, …):

```
                                                           │
                                                           │ 6a. failure
                                                           ▼
                                          Kafka: inventory.events
                                       (inventory.initialization.failed)
                                                           │
                                                           │ 6b. reply
                                                           ▼
                                                 Kafka: saga.events
                                          (saga.product.create.failed)
                                                           │
                                                           ▼
                              product-service SagaOrchestrator.onInventoryInitializationFailed()
                                                           │
                                                           │ compensation
                                                           ▼
                                              Kafka: product.events
                                          (product.creation.failed)
```

## Compensation

Compensation is currently a **publish of `product.creation.failed`**. Downstream
listeners can choose to soft-delete the product, notify an admin, etc. The
orchestrator's in-memory saga state transitions to `failed`. A future
enhancement could drive an automatic DELETE here.

## Saga state

The `SagaOrchestrator` keeps an in-memory `Map<sagaId, SagaState>` so it can
match replies to started sagas. This is acceptable for a single-instance
product-service; for HA you'd the state to Redis (we already have the redis
lib at `libs/redis`).

A saga state is GC'd on completion. For long-running sagas, add a TTL sweeper.

## Topics, groups, and consumer isolation

- product-service runs **one** consumer group `product-service-saga-replies`
  on `saga.events`. Only listens for `saga.product.create.*` reply events.
- inventory-service runs **one** consumer group `inventory-service-saga-commands`
  on `saga.events`. Only listens for `saga.product.create.started` commands.

Using different consumer groups means each service can scale independently
(horizontal scaling adds more consumers in the same group → partition rebalance).

## Local development

```bash
# Start infra (Postgres, Redis, Kafka, Zookeeper)
docker compose up -d

# Run migrations
cd apps/product-service
npx prisma migrate deploy

# Start the stack
cd ../..
node dev.js   # pick: product-service, inventory-service
```

Verify Kafka:

```bash
docker compose exec kafka \
  kafka-console-consumer --bootstrap-server localhost:9092 \
  --topic product.events --from-beginning --max-messages 5

docker compose exec kafka \
  kafka-console-consumer --bootstrap-server localhost:9092 \
  --topic saga.events --from-beginning --max-messages 5
```

## Configuration

| Env var | Default | Description |
|---|---|---|
| `KAFKA_BROKER` | `localhost:9092` | Kafka bootstrap broker |
| `KAFKA_CLIENT_ID` | `event-driven-order-system` | Kafka client id |
| `KAFKA_GROUP_ID` | `event-driven-order-system` | Default consumer group |
| `KAFKA_PRODUCT_TOPIC` | `product.events` | Override topic name |
| `KAFKA_INVENTORY_TOPIC` | `inventory.events` | Override topic name |
| `KAFKA_SAGA_TOPIC` | `saga.events` | Override topic name |