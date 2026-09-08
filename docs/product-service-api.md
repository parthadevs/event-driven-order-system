# Product Service — API Reference

Base URL: `http://<host>:<PRODUCT_SERVICE_PORT>` (default port `3004`)

All endpoints return JSON. Errors follow the standard NestJS exception format:

```json
{ "statusCode": 409, "message": "Product with SKU 'SKU-1' already exists", "error": "Conflict" }
```

## Health

### `GET /health`
Liveness probe. Always `200`.

### `GET /health/ready`
Readiness probe. Performs a `SELECT 1` against the products database.

---

## Products

### `POST /products`
Create a new product. Triggers the **product-create saga** which initializes inventory for the new product asynchronously.

**Request body**
```json
{
  "sku": "SKU-1234",
  "name": "Widget Pro",
  "description": "Optional description",
  "price": 19.99,
  "currency": "USD",
  "initialQuantity": 100
}
```

**Validation**
- `sku`: string, ≥ 2 chars
- `name`: non-empty string
- `price`: number, ≥ 0
- `currency`: optional, one of `USD | EUR | GBP | BDT`
- `initialQuantity`: optional number ≥ 0 (defaults to `0`)

**Response `201`**
```json
{
  "id": "b3e2...",
  "sku": "SKU-1234",
  "name": "Widget Pro",
  "description": "Optional description",
  "price": 19.99,
  "currency": "USD",
  "isActive": true,
  "version": 0,
  "createdAt": "2026-09-03T07:00:00.000Z",
  "updatedAt": "2026-09-03T07:00:00.000Z"
}
```

**Errors**
- `409 Conflict` — `Product with SKU '...' already exists`

> The response is returned as soon as the product row is persisted. Inventory initialization happens asynchronously via Kafka. See [saga-architecture.md](./saga-architecture.md).

---

### `GET /products`
List products with pagination.

**Query parameters**
| Param | Type | Default | Notes |
|---|---|---|---|
| `page` | number | 1 | 1-indexed |
| `limit` | number | 20 | capped at 100 |
| `isActive` | boolean | — | filter by status |
| `search` | string | — | matches `name` or `sku` (case-insensitive) |

**Response `200`**
```json
{
  "items": [ /* ProductEntity[] */ ],
  "total": 42,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

---

### `GET /products/:id`
Fetch a product by id.

**Response `200`** — single `ProductEntity`

**Errors**
- `404 Not Found`

---

### `GET /products/sku/:sku`
Fetch a product by SKU.

**Errors**
- `404 Not Found`

---

### `PATCH /products/:id`
Partial update. Only provided fields are modified.

**Request body**
```json
{ "name": "Widget Pro v2", "price": 24.99 }
```

**Response `200`** — updated `ProductEntity`

**Errors**
- `404 Not Found`
- `409 Conflict` — optimistic concurrency version mismatch (concurrent update). Retry.

---

### `DELETE /products/:id`
Soft-delete (sets `isActive = false`). Returns the deactivated product.

**Response `200`** — `ProductEntity` with `isActive: false`

**Errors**
- `404 Not Found`

---

## Concurrency

Updates use optimistic locking on `Product.version`. Concurrent writers will receive `409 Conflict` and should retry after re-fetching.

## Idempotency

- `POST /products` is idempotent **per SKU** thanks to the unique constraint.
- `DELETE /products/:id` is idempotent — calling twice on an already-deactivated product is a no-op.

## Example cURL session

```bash
# 1. Create product (returns 201; inventory init runs async)
curl -X POST http://localhost:3004/products \
  -H 'Content-Type: application/json' \
  -d '{"sku":"SKU-1234","name":"Widget Pro","price":19.99,"initialQuantity":100}'

# 2. List products
curl http://localhost:3004/products?limit=10

# 3. Fetch by id
curl http://localhost:3004/products/<id>

# 4. Update price
curl -X PATCH http://localhost:3004/products/<id> \
  -H 'Content-Type: application/json' \
  -d '{"price":24.99}'

# 5. Deactivate
curl -X DELETE http://localhost:3004/products/<id>
```