# 🚀 Event-Driven Order System

A production-oriented **event-driven microservices order management system** built with **NestJS, TypeScript, PostgreSQL, Apache Kafka, Redis, BullMQ, Prisma, and Docker**.

This project is primarily designed as a practical backend engineering project to learn and implement real-world distributed-system concepts.

The system focuses on:

* Microservices Architecture
* Event-Driven Architecture
* Apache Kafka
* Transactional Outbox Pattern
* Database-per-Service
* Eventual Consistency
* Idempotent Consumers
* Distributed System Reliability
* Clean Architecture
* SOLID Principles
* Redis
* BullMQ
* Background Workers
* Retry & Dead Letter Queues
* Authentication & Authorization
* API Gateway
* Observability
* Dockerized Deployment
* Production-oriented Backend Design

---

# 📌 Project Goal

The goal of this project is to build a realistic order-processing platform where different business capabilities are separated into independent microservices.

A typical order lifecycle will look like:

```text
Customer
   │
   ▼
API Gateway
   │
   ▼
Order Service
   │
   ├── Create Order
   ├── Save Order
   └── Create Outbox Event
           │
           ▼
         Kafka
           │
     ┌─────┴─────┐
     ▼           ▼
 Payment       Inventory
 Service       Service
     │           │
     ▼           ▼
Payment       Stock
Processing    Reservation
     │           │
     └─────┬─────┘
           ▼
         Kafka
           │
           ▼
     Order Service
           │
           ▼
      Order Confirmed
           │
           ▼
 Notification Service
           │
           ├── Email
           └── WebSocket
```

---

# 🏗️ Architecture

```text
                                  ┌──────────────┐
                                  │    Client    │
                                  └──────┬───────┘
                                         │
                                         ▼
                                ┌──────────────────┐
                                │   API Gateway    │
                                │      :3000       │
                                └────────┬─────────┘
                                         │
              ┌──────────────────────────┼──────────────────────────┐
              │                          │                          │
              ▼                          ▼                          ▼
      ┌──────────────┐          ┌──────────────┐          ┌──────────────┐
      │ Auth Service │          │ Order Service│          │  Inventory   │
      │              │          │              │          │   Service    │
      └──────┬───────┘          └──────┬───────┘          └──────┬───────┘
             │                         │                         │
             ▼                         ▼                         ▼
        ┌─────────┐               ┌─────────┐              ┌─────────────┐
        │ auth_db │               │order_db │              │ inventory_db│
        │Postgres │               │Postgres │              │  Postgres   │
        └─────────┘               └────┬────┘              └─────────────┘
                                       │
                                       ▼
                                ┌──────────────┐
                                │    Outbox    │
                                │    Events    │
                                └──────┬───────┘
                                       │
                                       ▼
                                ┌──────────────┐
                                │    Kafka     │
                                └──────┬───────┘
                                       │
                       ┌───────────────┼────────────────┐
                       │               │                │
                       ▼               ▼                ▼
                Payment Service  Inventory Service  Notification
                       │                                  Service
                       ▼                                      │
                  payment_db                                 │
                                                            ▼
                                                         BullMQ
                                                            │
                                                            ▼
                                                          Redis
                                                            │
                                                            ▼
                                                        Workers
```

---

# 📦 Monorepo Structure

```text
event-driven-order-system/
│
├── apps/
│   │
│   ├── api-gateway/
│   │
│   ├── auth-service/
│   │
│   ├── order-service/
│   │
│   ├── payment-service/
│   │
│   ├── inventory-service/
│   │
│   └── notification-service/
│
├── libs/
│   │
│   ├── auth/
│   ├── common/
│   ├── events/
│   ├── kafka/
│   └── redis/
│
├── infrastructure/
│   ├── docker/
│   ├── kafka/
│   ├── postgres/
│   ├── redis/
│   └── nginx/
│
├── docker-compose.yml
├── nest-cli.json
├── package.json
├── pnpm-lock.yaml
└── README.md
```

---

# 🧩 Services

## 1. API Gateway

The API Gateway is the single public entry point for clients.

### Responsibilities

* HTTP API
* API versioning
* Authentication forwarding
* Authorization
* Request validation
* Rate limiting
* Routing
* Error handling
* Correlation ID
* WebSocket gateway

### Important Rule

The API Gateway should remain **thin**.

It should not contain core business logic.

```text
Client
  ↓
API Gateway
  ↓
Business Service
```

---

# 2. Auth Service

Responsible for:

* User registration
* Login
* Password hashing
* JWT access token
* Refresh token
* Logout
* Token rotation
* Role-based authorization
* User management

### Database

```text
auth_db
├── users
├── refresh_tokens
└── sessions
```

Auth Service owns its database.

No other service should directly access `auth_db`.

---

# 3. Order Service

The Order Service is responsible for the complete order lifecycle.

### Responsibilities

* Create order
* Retrieve order
* List user orders
* Cancel order
* Order state management
* Create order items
* Publish order events
* Consume payment events
* Consume inventory events

### Database

```text
order_db
├── orders
├── order_items
├── outbox_events
└── processed_events
```

---

# 4. Payment Service

Responsible for:

* Payment creation
* Payment processing
* Payment success
* Payment failure
* Refund
* Payment status
* Payment idempotency
* Publishing payment events

### Database

```text
payment_db
├── payments
├── refunds
├── outbox_events
└── processed_events
```

---

# 5. Inventory Service

Responsible for:

* Product management
* Stock management
* Stock reservation
* Stock release
* Stock adjustment
* Inventory consistency
* Publishing inventory events

### Database

```text
inventory_db
├── products
├── inventory
├── stock_reservations
├── outbox_events
└── processed_events
```

---

# 6. Notification Service

Responsible for:

* Kafka event consumption
* Email notifications
* WebSocket notifications
* Notification history
* Background jobs
* Retry handling

Flow:

```text
Kafka
  ↓
Notification Consumer
  ↓
BullMQ
  ↓
Redis
  ↓
Notification Worker
  ↓
Email / WebSocket
```

---

# 🗄️ Database Architecture

The project follows the **Database-per-Service** pattern.

```text
Auth Service
     ↓
  auth_db

Order Service
     ↓
 order_db

Payment Service
     ↓
 payment_db

Inventory Service
     ↓
inventory_db
```

Services must never directly query another service's database.

### ❌ Wrong

```text
Order Service
      ↓
SELECT FROM payment_db.payments
```

### ✅ Correct

```text
Order Service
      ↓
Kafka Event
      ↓
Payment Service
      ↓
Payment DB
```

---

# 🐘 PostgreSQL Strategy

During development, a single PostgreSQL server/cluster can host multiple databases:

```text
PostgreSQL
│
├── auth_db
├── order_db
├── payment_db
└── inventory_db
```

This keeps development infrastructure simple.

Later, production workloads can be separated into independent PostgreSQL instances/clusters if required.

---

# 🔄 Transactional Outbox Pattern

One of the main learning goals of this project is implementing the **Transactional Outbox Pattern**.

## The Dual-Write Problem

Suppose Order Service does this:

```text
1. Save Order → PostgreSQL ✅

2. Publish order.created → Kafka ❌
```

If Kafka fails, the order exists but the event is lost.

This creates inconsistency.

---

# ✅ Transactional Outbox Solution

The database change and event are written inside the same PostgreSQL transaction.

```text
BEGIN

INSERT INTO orders

INSERT INTO outbox_events

COMMIT
```

Both succeed or both fail.

Then a separate publisher sends the event to Kafka.

```text
PostgreSQL
    │
    ▼
outbox_events
    │
    ▼
Outbox Publisher
    │
    ▼
Kafka
```

---

# 📋 Outbox Table

Example:

```text
outbox_events
├── id
├── aggregate_type
├── aggregate_id
├── event_type
├── payload
├── version
├── created_at
├── published_at
├── attempts
├── last_error
├── locked_at
└── locked_by
```

Example event:

```json
{
  "id": "event-id",
  "aggregateType": "Order",
  "aggregateId": "order-id",
  "eventType": "order.created",
  "version": 1,
  "payload": {
    "orderId": "order-id",
    "userId": "user-id",
    "total": 1500,
    "items": []
  },
  "createdAt": "2026-08-09T00:00:00Z"
}
```

---

# 🔥 Kafka Architecture

Kafka is the central event backbone of the system.

```text
Producer
   │
   ▼
Kafka Topic
   │
   ├───────────────┐
   ▼               ▼
Consumer A      Consumer B
```

---

# 📨 Domain Events

Main events:

```text
order.created
order.cancelled
order.confirmed
order.failed
order.completed

payment.created
payment.completed
payment.failed
payment.refunded

inventory.reserved
inventory.released
inventory.insufficient
```

---

# 🗂️ Kafka Topics

Recommended topics:

```text
order.events.v1
payment.events.v1
inventory.events.v1
notification.events.v1
```

For failed messages:

```text
order.events.v1.DLQ
payment.events.v1.DLQ
inventory.events.v1.DLQ
```

---

# 🔁 Order Processing Flow

## Successful Order

```text
POST /api/v1/orders
        │
        ▼
API Gateway
        │
        ▼
Order Service
        │
        ├── INSERT order
        ├── INSERT order_items
        └── INSERT outbox_event
                │
                ▼
             COMMIT
                │
                ▼
        Outbox Publisher
                │
                ▼
              Kafka
                │
                ▼
         order.created
          │           │
          ▼           ▼
       Payment     Inventory
       Service      Service
          │           │
          ▼           ▼
payment.completed inventory.reserved
          │           │
          └─────┬─────┘
                ▼
              Kafka
                │
                ▼
          Order Service
                │
                ▼
        Order CONFIRMED
                │
                ▼
      Notification Service
```

---

# ❌ Payment Failure Flow

```text
order.created
      │
      ▼
Payment Service
      │
      ▼
payment.failed
      │
      ▼
Order Service
      │
      ▼
Order FAILED
      │
      ▼
Inventory Service
      │
      ▼
Release Reservation
      │
      ▼
Notification Service
```

This demonstrates **eventual consistency** and **compensating actions**.

---

# 🔐 Idempotent Consumers

Kafka provides at-least-once delivery in common production designs.

Therefore, consumers must be idempotent.

Example:

```text
Kafka Event
    │
    ▼
Consumer
    │
    ▼
Check processed_events
    │
    ├── Event exists
    │       ↓
    │     Ignore
    │
    └── Event does not exist
            │
            ▼
       Process Event
            │
            ▼
    Save processed_event
```

Example table:

```text
processed_events
├── event_id
├── event_type
├── processed_at
└── consumer
```

The same event must not produce duplicate business effects.

---

# 🔁 Retry Strategy

Temporary failures should be retried.

```text
Consumer
   │
   ▼
Processing
   │
   ├── Success → Commit
   │
   └── Failure
        │
        ▼
      Retry
        │
        ├── Success
        │
        └── Failure
              │
              ▼
             DLQ
```

Example retry schedule:

```text
Retry 1 → 1 second
Retry 2 → 5 seconds
Retry 3 → 30 seconds
Retry 4 → 2 minutes
```

---

# ☠️ Dead Letter Queue

Events that cannot be processed after the configured retry limit are moved to a DLQ.

```text
Main Topic
    ↓
Consumer
    ↓
Retry
    ↓
Retry
    ↓
Retry
    ↓
DLQ
```

DLQ messages should preserve:

* Original event
* Error message
* Retry count
* Consumer name
* Timestamp

---

# 🧠 Idempotency

The system should support idempotency for operations such as:

```text
Create Order
Payment
Refund
Inventory Reservation
```

Example:

```text
Idempotency-Key: abc123
```

Repeated requests using the same key should not create duplicate business operations.

---

# 🧱 Clean Architecture

Each business service should follow a clean architecture structure.

Example:

```text
order-service/

src/
├── modules/
│   └── order/
│       │
│       ├── domain/
│       │   ├── entities/
│       │   ├── value-objects/
│       │   └── repositories/
│       │
│       ├── application/
│       │   ├── use-cases/
│       │   └── dto/
│       │
│       ├── infrastructure/
│       │   ├── persistence/
│       │   └── messaging/
│       │
│       └── presentation/
│           ├── controllers/
│           └── consumers/
│
├── config/
├── health/
└── main.ts
```

---

# 🧩 SOLID Principles

The project intentionally follows SOLID.

## Single Responsibility

Separate responsibilities:

```text
OrderController
OrderService
OrderRepository
OrderEventPublisher
```

---

## Open/Closed

Example payment providers:

```text
PaymentProvider
│
├── StripeProvider
├── PayPalProvider
└── MockPaymentProvider
```

---

## Liskov Substitution

Implementations should be replaceable through abstractions.

---

## Interface Segregation

Prefer small interfaces:

```text
OrderReader
OrderWriter
OrderCanceller
```

instead of one huge interface.

---

## Dependency Inversion

Business logic depends on abstractions.

```text
Order Use Case
      │
      ▼
OrderRepository
      ▲
      │
PrismaOrderRepository
```

---

# 📚 Shared Libraries

## `libs/common`

Reusable cross-service utilities.

Possible contents:

```text
common/
├── constants/
├── decorators/
├── exceptions/
├── filters/
├── interceptors/
├── pipes/
└── types/
```

Only truly generic functionality should go here.

---

# 🔐 `libs/auth`

Shared authentication contracts/utilities.

Possible contents:

```text
auth/
├── decorators/
├── guards/
├── interfaces/
└── types/
```

Business-specific authentication logic stays inside `auth-service`.

---

# 📨 `libs/events`

Shared domain event contracts.

Example:

```text
events/
├── order/
│   ├── order-created.event.ts
│   ├── order-cancelled.event.ts
│   └── order-confirmed.event.ts
│
├── payment/
│   ├── payment-completed.event.ts
│   └── payment-failed.event.ts
│
└── inventory/
    ├── inventory-reserved.event.ts
    └── inventory-released.event.ts
```

---

# 📨 `libs/kafka`

Reusable Kafka infrastructure.

```text
kafka/
├── kafka.module.ts
├── kafka.producer.ts
├── kafka.consumer.ts
├── kafka.client.ts
└── kafka.types.ts
```

Kafka infrastructure should be separated from business events.

---

# ⚡ `libs/redis`

Reusable Redis infrastructure.

```text
redis/
├── redis.module.ts
├── redis.service.ts
└── redis.types.ts
```

Redis can support:

* Cache
* BullMQ
* Rate limiting
* Distributed locks

Redis is not the primary source of truth.

---

# 🛣️ API Routes

## Authentication

```http
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
```

## Products

```http
GET    /api/v1/products
GET    /api/v1/products/:productId

POST   /api/v1/products
PATCH  /api/v1/products/:productId
DELETE /api/v1/products/:productId
```

## Orders

```http
POST   /api/v1/orders
GET    /api/v1/orders
GET    /api/v1/orders/:orderId
POST   /api/v1/orders/:orderId/cancel
```

## Payments

```http
POST   /api/v1/orders/:orderId/payments
GET    /api/v1/orders/:orderId/payments
GET    /api/v1/payments/:paymentId
POST   /api/v1/payments/:paymentId/refund
```

## Notifications

```http
GET    /api/v1/notifications
GET    /api/v1/notifications/unread
PATCH  /api/v1/notifications/:id/read
PATCH  /api/v1/notifications/read-all
```

---

# ❤️ Health Checks

Every service should expose:

```http
GET /health
GET /health/live
GET /health/ready
```

Readiness should verify dependencies such as:

```text
PostgreSQL
Kafka
Redis
```

---

# 📊 Metrics

Expose:

```http
GET /metrics
```

Metrics can later be collected by Prometheus.

Important metrics:

```text
HTTP request count
HTTP latency
HTTP error rate
Kafka consumer lag
Kafka throughput
Database connections
Redis usage
Queue size
Worker failures
```

---

# ⚡ Redis & BullMQ

Notification processing:

```text
Kafka
  ↓
Notification Consumer
  ↓
BullMQ Queue
  ↓
Redis
  ↓
Notification Worker
  ↓
Email Provider
```

Possible queues:

```text
email
notifications
websocket
cleanup
```

BullMQ will provide:

* Background processing
* Retry
* Delayed jobs
* Failed jobs
* Job prioritization

---

# 🔒 Authentication & Security

The system should implement:

* JWT access tokens
* Refresh tokens
* Password hashing
* RBAC
* Request validation
* Rate limiting
* CORS
* Helmet
* Secure headers
* Environment-based secrets
* Service authentication
* Database least privilege

Roles:

```text
USER
ADMIN
```

---

# 🔭 Observability

The system should implement:

```text
Structured Logging
        │
        ▼
Correlation ID
        │
        ▼
API Gateway
        │
        ▼
Microservice
        │
        ▼
Kafka Event
        │
        ▼
Consumer
```

A correlation ID should be propagated across the event lifecycle whenever possible.

---

# 🐳 Docker Infrastructure

Development environment:

```text
Docker Compose
│
├── PostgreSQL
├── Redis
├── Kafka
├── Kafka UI
├── Prometheus
└── Grafana
```

Application services:

```text
├── api-gateway
├── auth-service
├── order-service
├── payment-service
├── inventory-service
└── notification-service
```

---

# 🌍 Environment Configuration

Each service should manage its own environment configuration.

Example:

```env
NODE_ENV=development

APP_NAME=order-service
PORT=3001

DATABASE_URL=postgresql://...

KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=order-service
KAFKA_GROUP_ID=order-service-group

REDIS_HOST=localhost
REDIS_PORT=6379
```

Never commit secrets to Git.

Use:

```text
.env
.env.example
```

and secret management in production.

---

# 🧪 Testing Strategy

## Unit Tests

Test:

* Domain logic
* Use cases
* Services
* Event handlers
* Validation

## Integration Tests

Test:

* PostgreSQL repositories
* Kafka producers
* Kafka consumers
* Redis
* BullMQ

## E2E Tests

Test complete workflows.

```text
Register
   ↓
Login
   ↓
Create Order
   ↓
Payment
   ↓
Inventory Reservation
   ↓
Order Confirmation
   ↓
Notification
```

---

# 📈 Reliability Goals

The system should handle:

* Duplicate Kafka messages
* Kafka downtime
* Consumer crashes
* Database failures
* Network failures
* Payment failures
* Inventory failures
* Worker failures
* Notification failures

The design prioritizes:

```text
At-Least-Once Delivery
+
Idempotent Consumers
+
Retry
+
DLQ
```

rather than assuming that every distributed operation can be exactly-once.

---

# 🧠 Learning Objectives

By completing this project, the following concepts should become practical rather than theoretical:

### NestJS

* Modules
* Dependency Injection
* Guards
* Interceptors
* Pipes
* Filters
* Custom decorators
* Configuration
* Microservices

### PostgreSQL

* Transactions
* Isolation
* Indexing
* Constraints
* Locking
* Concurrency
* Migrations

### Prisma

* Schema design
* Relations
* Transactions
* Migrations
* Repository pattern

### Kafka

* Producers
* Consumers
* Topics
* Partitions
* Consumer Groups
* Offsets
* Rebalancing
* Retry
* DLQ
* Event ordering

### Distributed Systems

* Eventual consistency
* Idempotency
* At-least-once delivery
* Failure handling
* Compensation
* Distributed transactions
* Outbox Pattern

### Redis

* Caching
* Rate limiting
* Queue infrastructure
* Distributed locks

### BullMQ

* Workers
* Retry
* Delayed jobs
* Failed jobs
* Job queues

### Architecture

* SOLID
* Clean Architecture
* Dependency Inversion
* Repository Pattern
* Event-Driven Architecture
* Database-per-Service
* API Gateway

---

# 🗺️ Implementation Roadmap

## Phase 1 — Foundation

* [ ] NestJS monorepo
* [ ] Configure applications
* [ ] Configure shared libraries
* [ ] ESLint
* [ ] Prettier
* [ ] Environment configuration
* [ ] Docker development environment

---

## Phase 2 — Authentication

* [ ] Auth Service
* [ ] User registration
* [ ] Login
* [ ] Password hashing
* [ ] JWT
* [ ] Refresh token
* [ ] RBAC
* [ ] Redis integration

---

## Phase 3 — Order Service

* [ ] Order domain
* [ ] Order entity
* [ ] Order items
* [ ] Order repository
* [ ] Create order
* [ ] Get orders
* [ ] Cancel order
* [ ] Order state machine

---

## Phase 4 — Kafka

* [ ] Kafka Docker setup
* [ ] Kafka client library
* [ ] Producer
* [ ] Consumer
* [ ] Topics
* [ ] Consumer groups
* [ ] Event contracts
* [ ] Event versioning

---

## Phase 5 — Transactional Outbox

* [ ] Outbox table
* [ ] Atomic DB + outbox transaction
* [ ] Outbox publisher
* [ ] Kafka publishing
* [ ] Retry failed events
* [ ] Publisher concurrency handling
* [ ] Published event tracking

---

## Phase 6 — Payment Service

* [ ] Payment domain
* [ ] Payment DB
* [ ] Payment creation
* [ ] Payment processing
* [ ] Payment success
* [ ] Payment failure
* [ ] Refund
* [ ] Idempotency

---

## Phase 7 — Inventory Service

* [ ] Product model
* [ ] Inventory model
* [ ] Stock management
* [ ] Reservation
* [ ] Release
* [ ] Concurrency handling
* [ ] Inventory events

---

## Phase 8 — Eventual Consistency

Implement:

```text
Order Created
      ↓
Payment
      ↓
Inventory
      ↓
Order Confirmation
```

Handle failures with compensating actions.

---

## Phase 9 — Idempotency & Reliability

* [ ] Processed events
* [ ] Idempotent consumers
* [ ] Retry
* [ ] Exponential backoff
* [ ] DLQ
* [ ] Timeouts
* [ ] Circuit breaker
* [ ] Graceful shutdown

---

## Phase 10 — Redis & BullMQ

* [ ] Redis module
* [ ] Product cache
* [ ] Rate limiting
* [ ] BullMQ
* [ ] Workers
* [ ] Retry jobs
* [ ] Failed jobs

---

## Phase 11 — Notification Service

* [ ] Kafka consumers
* [ ] Notification domain
* [ ] Email queue
* [ ] Email worker
* [ ] WebSocket notifications
* [ ] Notification history

---

## Phase 12 — Observability

* [ ] Structured logging
* [ ] Correlation IDs
* [ ] Health checks
* [ ] Prometheus
* [ ] Grafana
* [ ] Kafka metrics
* [ ] Queue metrics
* [ ] Database metrics

---

## Phase 13 — Testing

* [ ] Unit tests
* [ ] Integration tests
* [ ] Kafka tests
* [ ] Repository tests
* [ ] E2E tests
* [ ] Failure scenario tests
* [ ] Load testing

---

## Phase 14 — Production

* [ ] Dockerize all services
* [ ] Production Docker Compose
* [ ] Nginx
* [ ] TLS
* [ ] Secrets management
* [ ] Database backups
* [ ] Kafka persistence
* [ ] Monitoring
* [ ] Logging
* [ ] Graceful deployment
* [ ] CI/CD

---

# 🎯 Definition of Done

The project will be considered complete when this workflow works reliably:

```text
User
 │
 ├── Register
 │
 ├── Login
 │
 └── Create Order
          │
          ▼
      API Gateway
          │
          ▼
      Order Service
          │
          ├── PostgreSQL Transaction
          │      ├── Order
          │      ├── Order Items
          │      └── Outbox Event
          │
          ▼
        Kafka
          │
     ┌────┴────┐
     ▼         ▼
 Payment    Inventory
 Service     Service
     │         │
     ▼         ▼
  Payment    Reserve
  Result     Stock
     │         │
     └────┬────┘
          ▼
        Kafka
          │
          ▼
    Order Service
          │
          ▼
    Order Confirmed
          │
          ▼
 Notification Service
          │
          ▼
    BullMQ + Redis
          │
          ▼
       Worker
          │
          ▼
    Email / WebSocket
```

The system must also correctly handle:

```text
Kafka failure
Database failure
Duplicate event
Consumer crash
Payment failure
Inventory failure
Notification failure
Worker failure
```

without corrupting business data.

---

# 🏆 Main Engineering Principles

This project follows these principles:

```text
1. Each service owns its data.

2. Never share business databases between services.

3. Use Kafka for asynchronous domain events.

4. Use REST only when synchronous communication is actually required.

5. Use Transactional Outbox for reliable event publishing.

6. Consumers must be idempotent.

7. Expect failures.

8. Use retries for transient failures.

9. Use DLQ for unrecoverable events.

10. Business logic should not depend directly on infrastructure.

11. Keep API Gateway thin.

12. Prefer eventual consistency over distributed transactions.

13. Keep shared libraries truly generic.

14. Do not create abstractions without a real reason.

15. Optimize for correctness before performance.
```

---

# 📚 Project Learning Order

Recommended order for learning this project:

```text
NestJS
  ↓
PostgreSQL + Prisma
  ↓
Clean Architecture
  ↓
SOLID
  ↓
Microservices
  ↓
Kafka Basics
  ↓
Kafka Producer / Consumer
  ↓
Event Design
  ↓
Transactional Outbox
  ↓
Idempotency
  ↓
Eventual Consistency
  ↓
Redis
  ↓
BullMQ
  ↓
Retry + DLQ
  ↓
Observability
  ↓
Docker
  ↓
Production Deployment
```

---

# 📌 Final Project Objective

This project is not intended to be a simple CRUD application.

The primary objective is to understand how a production backend behaves when:

```text
multiple services
        +
multiple databases
        +
asynchronous events
        +
network failures
        +
duplicate messages
        +
background processing
        +
eventual consistency
```

are combined into one system.

The final result should demonstrate practical knowledge of **NestJS microservices, Kafka, PostgreSQL transactions, Transactional Outbox, Redis, BullMQ, SOLID, Clean Architecture, and distributed-system reliability patterns**.

---

# 📄 License

This project is created for learning, experimentation, and portfolio purposes.
