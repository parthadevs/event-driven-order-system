import { DomainException } from '../exceptions/domain.exception';
import { ProductEntity } from '../entities/product.entity';

const base = (overrides: Partial<ProductEntity> = {}): ProductEntity => {
  const now = overrides.createdAt ?? new Date('2026-09-03T10:00:00Z');
  return new ProductEntity(
    overrides.id ?? 'p-1',
    overrides.sku ?? 'SKU-1',
    overrides.name ?? 'Widget',
    overrides.description ?? null,
    overrides.price ?? 9.99,
    overrides.currency ?? 'USD',
    overrides.isActive ?? true,
    overrides.createdAt ?? now,
    overrides.updatedAt ?? now,
    overrides.version ?? 0,
  );
};

describe('ProductEntity', () => {
  describe('update', () => {
    it('updates allowed fields', () => {
      const product = base({ price: 10 });
      product.update({
        name: 'Gadget',
        price: 12.5,
        description: 'desc',
        currency: 'eur',
      });
      expect(product.name).toBe('Gadget');
      expect(product.price).toBe(12.5);
      expect(product.description).toBe('desc');
      expect(product.currency).toBe('EUR');
    });

    it('rejects empty name', () => {
      const product = base();
      expect(() => product.update({ name: '' })).toThrow(DomainException);
      expect(() => product.update({ name: '   ' })).toThrow(DomainException);
    });

    it('rejects negative price', () => {
      const product = base();
      expect(() => product.update({ price: -1 })).toThrow(DomainException);
    });

    it('trims description and converts empty to null', () => {
      const product = base({ description: 'a' });
      product.update({ description: '  ' });
      expect(product.description).toBeNull();
    });
  });

  describe('deactivate / activate', () => {
    it('flips isActive', () => {
      const product = base({ isActive: true });
      product.deactivate();
      expect(product.isActive).toBe(false);
      product.activate();
      expect(product.isActive).toBe(true);
    });
  });
});
