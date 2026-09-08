import { ReservationStatus } from '@prisma/client';
import { InventoryEntity } from '../entities/inventory.entity';
import { InventoryReservationEntity } from '../entities/inventory-reservation.entity';
import { DomainException } from '../exceptions/domain.exception';

const build = (overrides: Partial<InventoryEntity> = {}): InventoryEntity => {
  const now = overrides.createdAt ?? new Date('2026-09-03T10:00:00Z');
  return new InventoryEntity(
    overrides.id ?? 'inv-1',
    overrides.productId ?? 'prod-1',
    overrides.quantity ?? 100,
    overrides.reservedQuantity ?? 0,
    overrides.createdAt ?? now,
    overrides.updatedAt ?? now,
    overrides.reservations ?? [],
    overrides.version ?? 0,
    overrides.reservationTtlMs ?? 60_000,
  );
};

describe('InventoryEntity', () => {
  describe('availableQuantity', () => {
    it('returns quantity minus reservedQuantity', () => {
      const inv = build({ quantity: 50, reservedQuantity: 12 });
      expect(inv.availableQuantity).toBe(38);
    });
  });

  describe('addQuantity / removeQuantity', () => {
    it('adds positive amounts', () => {
      const inv = build({ quantity: 10 });
      inv.addQuantity(5);
      expect(inv.quantity).toBe(15);
    });

    it('rejects non-positive amounts', () => {
      const inv = build();
      expect(() => inv.addQuantity(0)).toThrow(DomainException);
      expect(() => inv.addQuantity(-1)).toThrow(DomainException);
      expect(() => inv.removeQuantity(0)).toThrow(DomainException);
    });

    it('refuses to remove more than is available', () => {
      const inv = build({ quantity: 10, reservedQuantity: 8 });
      expect(() => inv.removeQuantity(5)).toThrow(DomainException);
    });
  });

  describe('adjust', () => {
    it('sets quantity when above reservedQuantity', () => {
      const inv = build({ quantity: 50, reservedQuantity: 10 });
      inv.adjust(80);
      expect(inv.quantity).toBe(80);
    });

    it('refuses to set below reservedQuantity', () => {
      const inv = build({ quantity: 50, reservedQuantity: 10 });
      expect(() => inv.adjust(5)).toThrow(DomainException);
    });
  });

  describe('reserve', () => {
    it('creates a reservation with TTL and updates reservedQuantity', () => {
      const inv = build({ quantity: 10 });
      const before = new Date('2026-09-03T10:00:00Z');
      const res = inv.reserve(3, 'order-1', 'res-1', before);

      expect(inv.reservedQuantity).toBe(3);
      expect(inv.reservations).toHaveLength(1);
      expect(res.status).toBe(ReservationStatus.RESERVED);
      expect(res.expiresAt?.toISOString()).toBe('2026-09-03T10:01:00.000Z');
    });

    it('rejects when not enough available', () => {
      const inv = build({ quantity: 5 });
      expect(() => inv.reserve(10, 'order-1', 'res-1')).toThrow(
        DomainException,
      );
    });

    it('rejects duplicates for the same order', () => {
      const inv = build({ quantity: 10 });
      inv.reserve(2, 'order-1', 'res-1');
      expect(() => inv.reserve(3, 'order-1', 'res-2')).toThrow(DomainException);
    });
  });

  describe('confirmReservation / releaseReservation', () => {
    const invWithReservation = () => {
      const inv = build({ quantity: 10 });
      inv.reserve(4, 'order-1', 'res-1');
      return inv;
    };

    it('confirm deducts from quantity and reservedQuantity', () => {
      const inv = invWithReservation();
      inv.confirmReservation('order-1');
      expect(inv.quantity).toBe(6);
      expect(inv.reservedQuantity).toBe(0);
      expect(inv.reservations[0].status).toBe(ReservationStatus.CONFIRMED);
    });

    it('release only frees reservedQuantity back to available', () => {
      const inv = invWithReservation();
      inv.releaseReservation('order-1');
      expect(inv.quantity).toBe(10);
      expect(inv.reservedQuantity).toBe(0);
      expect(inv.reservations[0].status).toBe(ReservationStatus.RELEASED);
    });

    it('throws when no active reservation exists', () => {
      const inv = build({ quantity: 10 });
      expect(() => inv.confirmReservation('nope')).toThrow(DomainException);
      expect(() => inv.releaseReservation('nope')).toThrow(DomainException);
    });
  });

  describe('expireReservations', () => {
    it('expires reservations past their expiresAt', () => {
      const past = new Date('2026-09-03T10:00:00Z');
      const inv = build({ quantity: 10 });
      inv.reserve(2, 'order-1', 'res-1', past);

      const future = new Date('2026-09-03T10:05:00Z');
      const expired = inv.expireReservations(future);

      expect(expired).toHaveLength(1);
      expect(expired[0].status).toBe(ReservationStatus.EXPIRED);
      expect(inv.reservedQuantity).toBe(0);
    });

    it('does not expire reservations still within TTL', () => {
      const now = new Date('2026-09-03T10:00:00Z');
      const inv = build({ quantity: 10 });
      inv.reserve(2, 'order-1', 'res-1', now);

      const slightlyAfter = new Date('2026-09-03T10:00:30Z');
      const expired = inv.expireReservations(slightlyAfter);

      expect(expired).toHaveLength(0);
      expect(inv.reservations[0].status).toBe(ReservationStatus.RESERVED);
    });
  });
});

describe('InventoryReservationEntity', () => {
  const buildReservation = (
    overrides: Partial<InventoryReservationEntity> = {},
  ) =>
    new InventoryReservationEntity(
      overrides.id ?? 'res-1',
      overrides.inventoryId ?? 'inv-1',
      overrides.orderId ?? 'order-1',
      overrides.quantity ?? 3,
      overrides.status ?? ReservationStatus.RESERVED,
      overrides.createdAt ?? new Date(),
      overrides.updatedAt ?? new Date(),
      overrides.expiresAt ?? new Date(Date.now() + 60_000),
    );

  it('confirm moves RESERVED → CONFIRMED', () => {
    const r = buildReservation();
    r.confirm();
    expect(r.status).toBe(ReservationStatus.CONFIRMED);
  });

  it('release moves RESERVED → RELEASED', () => {
    const r = buildReservation();
    r.release();
    expect(r.status).toBe(ReservationStatus.RELEASED);
  });

  it('cannot confirm twice', () => {
    const r = buildReservation();
    r.confirm();
    expect(() => r.confirm()).toThrow(DomainException);
  });

  it('cannot release a non-reserved reservation', () => {
    const r = buildReservation();
    r.release();
    expect(() => r.release()).toThrow(DomainException);
  });

  it('expire requires expiresAt to have passed', () => {
    const r = buildReservation({ expiresAt: new Date(Date.now() - 1000) });
    r.expire();
    expect(r.status).toBe(ReservationStatus.EXPIRED);
  });

  it('expire throws if expiresAt is in the future', () => {
    const r = buildReservation({ expiresAt: new Date(Date.now() + 60_000) });
    expect(() => r.expire()).toThrow(DomainException);
  });
});
