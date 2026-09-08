# Inventory Service — API Reference

Base URL: `http://<host>:<INVENTORY_SERVICE_PORT>` (default port `3003`)

All endpoints return JSON. Errors follow the standard NestJS exception format:

```json
{ "statusCode": 404, "message": "Inventory for product p-1 not found", "error": "Not Found" }
```

## Health

### `GET /health`
Liveness probe. Always returns `200`.

```json
{ "status": "ok", "service": "inventory-service", "timestamp": "2026-09-03T07:42:11.123Z" }
```

### `GET /health/ready`
Readiness probe. Performs a `SELECT 1` against the database.

- `200` → `{ "status": "ready", "service": "inventory-service" }`
- `503` → `{ "status": "unavailable", "service": "inventory-service", "error": "..." }` (when DB is unreachable)

---

## Inventory resource

All endpoints are scoped under `/inventory`. `{productId}` is a URL parameter.

### `POST /inventory/:productId/stock`
Initialize inventory for a new product. Idempotent on conflict.

**Request body**
```json
{ "quantity": 100 }
```

**Validation**
- `quantity`: number, ≥ 0

**Response `201`** — full `InventoryEntity`
```json
{
  "id": "b3e2...",
  "productId": "prod-1",
  "quantity": 100,
  "reservedQuantity": 0,
  "availableQuantity": 100,
  "version": 0,
  "createdAt": "2026-09-03T07:00:00.000Z",
  "updatedAt": "2026-09-03T07:00:00.000Z",
  "reservations": []
}
```

**Errors**
- `409 Conflict` — `Inventory for product {productId} already exists`

---

### `GET /inventory/:productId`
Fetch current inventory state.

**Response `200`** — same shape as above.

**Errors**
- `404 Not Found` — `Inventory for product {productId} not found`

---

### `POST /inventory/:productId/reserve`
Reserve stock for an order. Atomic — uses optimistic concurrency.

**Request body**
```json
{ "orderId": "order-123", "quantity": 3 }
```

**Validation**
- `orderId`: non-empty string
- `quantity`: integer ≥ 1

**Behavior**
- Decreases `availableQuantity` (increases `reservedQuantity`)
- Creates a reservation row with `status = RESERVED` and `expiresAt = now + INVENTORY_RESERVATION_TTL_MS` (default `900_000` ms = 15 minutes)
- Returns `409 Conflict` (via `DomainException`) if a reservation already exists for the same `orderId` on this product

**Response `201`** — updated `InventoryEntity` with `reservations` array containing the new entry

**Errors**
- `404 Not Found` — product has no inventory
- `409 Conflict` — duplicate reservation for `orderId`
- `409 Conflict` — concurrent modification (optimistic lock lost). Caller should retry.

---

### `POST /inventory/:productId/confirm`
Confirm a previously-reserved order (i.e. the order was paid; stock is permanently deducted).

**Request body**
```json
{ "orderId": "order-123" }
```

**Behavior**
- Sets the matching `RESERVED` reservation to `CONFIRMED`
- Decrements `quantity` and `reservedQuantity` by the reservation amount

**Response `200`** — updated `InventoryEntity`

**Errors**
- `404 Not Found` — product has no inventory
- `409 Conflict` — no active reservation for `orderId`

---

### `POST /inventory/:productId/release`
Release a reservation back to the available pool (order cancelled, timed out manually, etc.).

**Request body**
```json
{ "orderId": "order-123" }
```

**Behavior**
- Sets the matching `RESERVED` reservation to `RELEASED`
- Decrements `reservedQuantity` by the reservation amount; `quantity` is unchanged

**Response `200`** — updated `InventoryEntity`

**Errors**
- `404 Not Found` — product has no inventory
- `409 Conflict` — no active reservation for `orderId`

---

### `POST /inventory/:productId/adjust`
Set the absolute `quantity` (admin operation — e.g. after a stock-take).

**Request body**
```json
{ "quantity": 250 }
```

**Validation**
- `quantity`: number ≥ 0
- The new `quantity` must be ≥ `reservedQuantity` (cannot adjust below in-flight reservations)

**Behavior**
- Sets `quantity` directly. `reservedQuantity` and active reservations are preserved.

**Response `200`** — updated `InventoryEntity`

**Errors**
- `404 Not Found` — product has no inventory
- `409 Conflict` — target quantity < reservedQuantity

---

## Reservation lifecycle

| Status | Set by | Meaning |
|---|---|---|
| `RESERVED` | `POST /reserve` | Stock is held, waiting on the order |
| `CONFIRMED` | `POST /confirm` | Order paid — stock permanently deducted |
| `RELEASED` | `POST /release` | Order cancelled — stock returned to available pool |
| `EXPIRED` | Sweeper (`ReservationSweeper`) | TTL elapsed without confirmation/release — stock auto-returned |

## Automatic expiration

A background sweeper runs every `INVENTORY_SWEEPER_INTERVAL_MS` ms (default `60_000` = 1 minute). It:

1. Finds all `Inventory` rows that have at least one `RESERVED` reservation whose `expiresAt < now`.
2. Marks each expired reservation as `EXPIRED` and frees its quantity back to the available pool.
3. Persists the changes inside the same optimistic-concurrency transaction used elsewhere.

Disable with `INVENTORY_SWEEPER_DISABLED=true`.

## Concurrency

All write paths use **optimistic concurrency** on `Inventory.version`. Two concurrent `reserve` calls will result in one succeeding and the other receiving an error recommending a retry. Clients should re-fetch and retry on conflict.

## Idempotency

- `POST /reserve` is idempotent **per order** thanks to the `@@unique([inventoryId, orderId])` constraint plus an in-memory check. Repeat calls with the same `orderId` will not double-reserve.
- `POST /confirm` and `POST /release` are idempotent in effect (calling twice on the same `orderId` is a no-op for the second call, returning `409 Conflict` for "no active reservation").

## Example cURL session

```bash
# 1. Initialize stock for product prod-1
curl -X POST http://localhost:3003/inventory/prod-1/stock \
  -H 'Content-Type: application/json' \
  -d '{"quantity": 100}'

# 2. Reserve 3 units for order-123
curl -X POST http://localhost:3003/inventory/prod-1/reserve \
  -H 'Content-Type: application/json' \
  -d '{"orderId": "order-123", "quantity": 3}'

# 3. (After payment) Confirm the reservation
curl -X POST http://localhost:3003/inventory/prod-1/confirm \
  -H 'Content-Type: application/json' \
  -d '{"orderId": "order-123"}'

# 4. (Or release it)
curl -X POST http://localhost:3003/inventory/prod-1/release \
  -H 'Content-Type: application/json' \
  -d '{"orderId": "order-123"}'

# 5. Inspect
curl http://localhost:3003/inventory/prod-1
```