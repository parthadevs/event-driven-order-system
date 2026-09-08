import { DomainException } from '../exceptions/domain.exception';

export class ProductEntity {
  constructor(
    public readonly id: string,
    public sku: string,
    public name: string,
    public description: string | null,
    public price: number,
    public currency: string,
    public isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public version: number = 0,
  ) {}

  public update(input: {
    name?: string;
    description?: string | null;
    price?: number;
    currency?: string;
    isActive?: boolean;
  }): void {
    if (input.name !== undefined) {
      this.assertNonEmpty(input.name, 'name');
      this.name = input.name.trim();
    }
    if (input.description !== undefined) {
      const trimmed = input.description?.trim();
      this.description = trimmed && trimmed.length > 0 ? trimmed : null;
    }
    if (input.price !== undefined) {
      this.assertPositive(input.price, 'price');
      this.price = input.price;
    }
    if (input.currency !== undefined) {
      this.assertNonEmpty(input.currency, 'currency');
      this.currency = input.currency.toUpperCase();
    }
    if (input.isActive !== undefined) {
      this.isActive = input.isActive;
    }
  }

  public deactivate(): void {
    this.isActive = false;
  }

  public activate(): void {
    this.isActive = true;
  }

  private assertNonEmpty(value: string, field: string): void {
    if (!value || value.trim().length === 0) {
      throw new DomainException(`Product ${field} cannot be empty`);
    }
  }

  private assertPositive(value: number, field: string): void {
    if (!(value >= 0)) {
      throw new DomainException(`Product ${field} must be non-negative`);
    }
  }
}
