# Inventory Service — Fix Notes

This document tracks the issues identified in the original report and what was fixed.

| # | Issue | Status | Resolution |
|---|---|---|---|
| 1 | Race conditions / no optimistic locking | ✅ Fixed | Added `version` column on `Inventory`. `PrismaInventoryRepository.save()` now performs `update where: { id, version }` and increments `version` atomically inside a transaction. Concurrent updates raise `P2025` which the repo surfaces as a retry-required exception. |
| 2 | Duplicated `ReservationStatus` enum | ✅ Fixed | Domain now imports the enum from `@prisma/client`. The `ReservationStatus` re-export remains for backwards compatibility inside the domain layer, but there is one source of truth. |
| 3 | No reservation expiration | ✅ Fixed | Added `expiresAt` column on `InventoryReservation` (with index `(status, expiresAt)`). Domain entity gained `expire()` and `isExpired()` plus `InventoryEntity.expireReservations()`. New `ExpireReservationsUseCase` is invoked periodically by a new `ReservationSweeper` (configurable via `INVENTORY_SWEEPER_INTERVAL_MS`, disable via `INVENTORY_SWEEPER_DISABLED=true`). Default TTL = 15 minutes (`INVENTORY_RESERVATION_TTL_MS`). |
| 4 | `/inventory/:productId/adjust` was unimplemented | ✅ Fixed | Added `AdjustInventoryDto`, `AdjustInventoryUseCase`, and `InventoryEntity.adjust()` (with guard against going below `reservedQuantity`). Controller wired up. |
| 5 | Validation pipe not enabled | ✅ Fixed | `main.ts` now installs a global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })`. DTOs use `class-validator` decorators. |
| 6 | Prisma query events declared but not subscribed | ✅ Fixed | `PrismaServiced` now subscribes to `query` events in `onModuleInit` and logs slow queries (>200 ms) as warnings. |
| 7 | No idempotency for reserve | ✅ Fixed | `InventoryEntity.reserve()` now refuses to create a second `RESERVED` row for the same `orderId`. The `@@unique([inventoryId, orderId])` constraint + `P2002` mapping in the repository handle retries from another node. |
| 8 | No health/readiness endpoints | ✅ Fixed | New `HealthController` exposing `GET /health` (liveness) and `GET /health/ready` (DB check). |
| 9 | Default Nest e2e test was wrong | ✅ Fixed | Replaced with `/health` smoke test in `apps/inventory-service/test/app.e2e-spec.ts`. |
| 10 | No domain tests | ✅ Fixed | Added `inventory.entity.spec.ts` covering `availableQuantity`, `addQuantity`, `removeQuantity`, `adjust`, `reserve`, `confirmReservation`, `releaseReservation`, `expireReservations`, and `InventoryReservationEntity` lifecycle (confirm/release/expire transitions and guards). |
| 11 | Domain event publishing | ⏭ Deferred | Out of scope for this service — requires shared event-bus plumbing across the monorepo. The domain layer is structured so events can be added without touching controllers. |

## Migrations

A new migration `apps/inventory-service/prisma/migrations/20260903000000_add_version_and_expiry/migration.sql` was added with:

```sql
ALTER TABLE "Inventory" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "InventoryReservation" ADD COLUMN "expiresAt" TIMESTAMP(3);
CREATE INDEX "InventoryReservation_status_expiresAt_idx" ON "InventoryReservation"("status", "expiresAt");
```

Run with `npx prisma migrate deploy` from `apps/inventory-service/`.

## New / changed files

```
apps/inventory-service/
├── prisma/
│   ├── schema.prisma                                            (updated: version + expiresAt + index)
│   └── migrations/20260903000000_add_version_and_expiry/
│       └── migration.sql                                        (new)
├── src/
│   ├── main.ts                                                  (updated: ValidationPipe)
│   ├── modules/inventory/
│   │   ├── inventory.module.ts                                  (updated: new providers/controllers)
│   │   ├── application/
│   │   │   ├── dto/inventory.dto.ts                             (updated: OrderIdDto, AdjustInventoryDto)
│   │   │   └── use-cases/
│   │   │       ├── adjust-inventory.use-case.ts                 (new)
│   │   │       ├── expire-reservations.use-case.ts              (new)
│   │   │       └── initialize-inventory.use-case.ts             (updated: uses create())
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   ├── inventory-reservation.entity.ts              (updated: expire/isExpired, Prisma enum)
│   │   │   │   ├── inventory.entity.ts                          (updated: version, adjust, expireReservations, idempotent reserve)
│   │   │   │   └── inventory.entity.spec.ts                    (new)
│   │   │   └── repositories/inventory.repository.ts            (updated: interface)
│   │   ├── infrastructure/
│   │   │   ├── persistence/prisma-inventory.repository.ts      (updated: optimistic lock, expiresAt, findById, findExpiredReservations, create)
│   │   │   └── sweeper/reservation.sweeper.ts                   (new)
│   │   └── presentation/
│   │       └── controllers/
│   │           ├── inventory.controller.ts                     (updated: OrderIdDto, adjust route)
│   │           └── health.controller.ts                         (new)
│   └── infrastructure/persistence/prisma/prisma.service.ts      (updated: query event subscription)
└── test/app.e2e-spec.ts                                         (updated: /health smoke test)

docs/
├── inventory-service-api.md                                     (new)
└── inventory-service-fixes.md                                   (new — this file)
```

## How to verify

```bash
# Generate Prisma client + apply migrations (requires DATABASE_URL pointing at a Postgres)
pnpx prisma generate --schema=apps/inventory-service/prisma/schema.prisma
pnpx prisma migrate deploy --schema=apps/inventory-service/prisma/schema.prisma

# Unit tests (domain entity)
pnpm test -- --testPathPattern=apps/inventory-service

# e2e (boots the service against the configured DB)
pnpm test:e2e -- --config=apps/inventory-service/test/jest-e2e.json
```