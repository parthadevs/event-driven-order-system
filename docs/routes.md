# API Routes & Service Architecture

E-commerce microservices platform — API Gateway + Order / Payment / Inventory / Notification / Auth services, event-driven via Kafka with the outbox pattern.

---

## 1. Service Ownership

| Domain | Owning Service | Notes |
|---|---|---|
| Auth / Identity | **Auth Service** (dedicated) | Gateway does NOT own auth logic — it only validates JWTs on incoming requests. Login/register/refresh proxy to this service. |
| Products & Stock | Inventory Service | Product catalog + stock live together — stock reservation is always consistency-critical with product existence. |
| Orders | Order Service | Owns order lifecycle + saga orchestration state. |
| Payments | Payment Service | Owns charge/refund logic and PSP (Stripe/etc.) integration. |
| Notifications | Notification Service | Read-only REST surface; creation is event-driven only, never a public route. |

**Why a dedicated Auth Service instead of gateway-embedded auth:** the gateway should stay stateless and fast — validating a JWT signature is O(1), but login/register need a database (users, password hashes, refresh token rotation). Bundling that into the gateway makes it a stateful bottleneck and couples deployment of "routing" with "identity," which should scale and fail independently.

---

## 2. API Gateway — Public Routes

### Auth (proxied to Auth Service)
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
```

### Products (proxied to Inventory Service)
```
GET    /api/v1/products
GET    /api/v1/products/:productId
GET    /api/v1/products/:productId/stock
```

**Admin-only** (require `role: admin` on JWT):
```
POST   /api/v1/products
PATCH  /api/v1/products/:productId
DELETE /api/v1/products/:productId
PATCH  /api/v1/products/:productId/stock
POST   /api/v1/products/:productId/stock/adjust
```

> `stock/adjust` is for manual admin corrections (damaged goods, recount, etc.) — it is explicitly **not** the internal reservation path. Reservation happens only via the `order.created` Kafka event, never through a REST call, so it can never be raced or bypassed by a client.

### Orders (proxied to Order Service)
```
POST   /api/v1/orders
GET    /api/v1/orders
GET    /api/v1/orders/:orderId
POST   /api/v1/orders/:orderId/cancel
```

### Payments (proxied to Payment Service)
```
POST   /api/v1/orders/:orderId/payments
GET    /api/v1/orders/:orderId/payments
GET    /api/v1/payments/:paymentId
POST   /api/v1/payments/:paymentId/refund
```

> **Naming fix:** standardized on `orders/:orderId/payments` (payment is always order-scoped, so it nests under `orders`) instead of the earlier `payments/orders/:orderId` variant — pick one shape and this is it.
>
> **Refund authorization:** `POST /payments/:paymentId/refund` requires `role: admin` or `role: support`, checked at the Gateway AND re-checked in Payment Service (defense in depth — never trust the gateway check alone for money-moving operations). This is a **client-initiated manual refund** (e.g. support issuing a refund for a complaint) — it is a completely separate code path from the **system-initiated compensating refund** that fires automatically inside the saga when inventory can't fulfill a paid order (see §4).

### Notifications (proxied to Notification Service)
```
GET    /api/v1/notifications
GET    /api/v1/notifications/unread
PATCH  /api/v1/notifications/:id/read
PATCH  /api/v1/notifications/read-all
```

> No `POST /notifications` route exists anywhere, on purpose. Notifications are only ever created by the Notification Service consuming Kafka events — there is no legitimate client-facing reason to create one directly, and exposing that route would just be an unused attack surface.

### Observability
```
GET /health          # aggregate liveness+readiness for this service
GET /health/live      # process is up (for k8s liveness probe)
GET /health/ready      # dependencies (DB, Kafka, Redis) are reachable (for k8s readiness probe)
GET /metrics          # Prometheus scrape endpoint
```

> Kept separate from `/health` — metrics is an observability concern (Prometheus format, scraped periodically), health checks are an orchestration concern (k8s probes, pass/fail). Different consumers, different formats, shouldn't share a heading.

---

## 3. Gateway Routing Map

```
Client
  │
  ▼
API Gateway  (JWT validation only — no business logic)
  │
  ├── /api/v1/auth/*           → Auth Service
  ├── /api/v1/products/*       → Inventory Service
  ├── /api/v1/orders/*         → Order Service
  ├── /api/v1/payments/*       → Payment Service
  └── /api/v1/notifications/*  → Notification Service
```

---

## 4. Order Saga — Sequential, Not Parallel

### The problem with running Payment + Inventory in parallel

Firing `order.created` and letting Payment Service and Inventory Service both react to it **independently and simultaneously** creates two failure modes with no clean recovery:

- **Payment succeeds, Inventory fails (out of stock):** the customer has been charged for something that can't be delivered. Now you need an emergency refund — slow, costly, bad customer experience, and a support ticket.
- **Inventory reserves, Payment fails (card declined):** stock is now held for an order that will never be paid, silently starving other customers of that inventory until something notices and releases it.

Both branches need compensating logic, and because the two events race, you can't even guarantee which failure you're compensating for first.

### The fix: reserve stock first (cheap, reversible), charge money second (expensive, hard to reverse)

General saga principle: **order operations from cheapest-to-reverse to most-expensive-to-reverse.** A stock counter decrement/increment is nearly free and instant. A payment charge/refund involves a third-party PSP, settlement delay, and a worse customer-facing outcome if it has to be undone.

```
POST /api/v1/orders
        │
        ▼
   API Gateway
        │
        ▼
   Order Service
        │
        ├── PostgreSQL transaction (single commit)
        │       ├── orders            (status: PENDING)
        │       ├── order_items
        │       └── outbox_events     (order.created)
        │
        ▼
   Debezium CDC → Kafka topic: order.events
        │
        ▼
  Inventory Service consumes order.created
        │
        ├─ Stock available?
        │
   ┌────┴────┐
   │ YES     │ NO
   ▼         ▼
reserve   emit inventory.reservation_failed
stock          │
   │            ▼
   │      Order Service: order → FAILED
   │      (no payment was ever attempted — nothing to compensate)
   ▼
emit inventory.reserved
        │
        ▼
  Payment Service consumes inventory.reserved
        │
        ├─ Charge succeeds?
        │
   ┌────┴────┐
   │ YES     │ NO
   ▼         ▼
emit      emit payment.failed
payment.       │
completed      ▼
   │      Inventory Service consumes payment.failed
   │      → releases the reserved stock (compensating action)
   │      → emits inventory.released
   │            │
   │            ▼
   │      Order Service: order → FAILED
   ▼
Order Service: order → CONFIRMED
```

### Required events (additions to the original design)

| Event | Producer | Consumer(s) | Purpose |
|---|---|---|---|
| `order.created` | Order Service | Inventory Service | Kicks off the saga |
| `inventory.reserved` | Inventory Service | Payment Service | Stock is held; safe to charge |
| `inventory.reservation_failed` | Inventory Service | Order Service | Out of stock — no charge attempted |
| `payment.completed` | Payment Service | Order Service, Notification Service | Charge succeeded |
| `payment.failed` | Payment Service | Inventory Service, Order Service | Charge failed — **triggers compensation** |
| `inventory.released` | Inventory Service | Order Service | Compensating stock release confirmed |
| `order.cancelled` | Order Service | Inventory Service, Payment Service | User-initiated cancel — same compensation path as `payment.failed` if payment already completed |

> `order.cancelled` (from `POST /orders/:orderId/cancel`) needs to branch depending on saga state: if payment hasn't happened yet, just cancel + release stock. If payment already completed, it needs to trigger an actual refund through Payment Service — this is the **system-initiated** refund path referenced in §2, distinct from the admin-initiated `POST /payments/:paymentId/refund`.

### Order status state machine

```
PENDING
   │
   ├──(inventory.reservation_failed)──→ FAILED
   │
   ├──(inventory.reserved, then payment.failed)──→ FAILED
   │
   ├──(inventory.reserved, then payment.completed)──→ CONFIRMED
   │
   └──(user cancels while PENDING)──→ CANCELLED
```

`CONFIRMED` orders can still transition via `order.cancelled` → triggers refund saga → ends in `CANCELLED` (post-refund), but that's a distinct, slower path (refund settlement time) worth modeling as its own state if you want to be precise — e.g. `CANCELLATION_PENDING` → `CANCELLED`.

---

## 5. Final Route Structure (Reference)

```
API Gateway
│
├── /api/v1/auth
│   ├── POST   /register
│   ├── POST   /login
│   ├── POST   /refresh
│   ├── POST   /logout
│   └── GET    /me
│
├── /api/v1/products
│   ├── GET    /
│   ├── GET    /:productId
│   ├── GET    /:productId/stock
│   ├── POST   /                          [admin]
│   ├── PATCH  /:productId                [admin]
│   ├── DELETE /:productId                [admin]
│   ├── PATCH  /:productId/stock          [admin]
│   └── POST   /:productId/stock/adjust   [admin]
│
├── /api/v1/orders
│   ├── POST   /
│   ├── GET    /
│   ├── GET    /:orderId
│   └── POST   /:orderId/cancel
│
├── /api/v1/orders/:orderId/payments
│   ├── POST   /
│   └── GET    /
│
├── /api/v1/payments
│   ├── GET    /:paymentId
│   └── POST   /:paymentId/refund         [admin | support]
│
├── /api/v1/notifications
│   ├── GET    /
│   ├── GET    /unread
│   ├── PATCH  /:id/read
│   └── PATCH  /read-all
│
├── /health
├── /health/live
├── /health/ready
└── /metrics
```

---

## 6. Open Decisions Still Worth Nailing Down

- **Cancellation while `CONFIRMED`:** does it require a `CANCELLATION_PENDING` intermediate status, or is a synchronous refund call acceptable for v1? (Async is safer but adds a state.)
- **Idempotency on `POST /orders`:** client should send an `Idempotency-Key` header so a network retry from the client doesn't create a duplicate order — separate concern from the internal Kafka at-least-once idempotency already handled in the outbox/CDC layer.
- **Timeout on the saga:** if Inventory or Payment never responds (service down), how long does an order sit in `PENDING` before Order Service times it out and marks it `FAILED`? Worth a scheduled sweep job (`orders WHERE status = PENDING AND created_at < now() - interval '10 minutes'`).
