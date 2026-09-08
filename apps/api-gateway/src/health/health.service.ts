import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';

type ServiceName = 'auth' | 'orders' | 'inventory' | 'product';

interface ServiceHealth {
  status: 'ok' | 'unavailable';
  response?: unknown;
  error?: string;
  responseTimeMs: number;
}

@Injectable()
export class HealthService {
  private readonly services: ReadonlyArray<{ name: ServiceName; client: ClientProxy }>;

  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    @Inject('ORDERS_SERVICE') private readonly ordersClient: ClientProxy,
    @Inject('INVENTORY_SERVICE') private readonly inventoryClient: ClientProxy,
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientProxy,
  ) {
    this.services = [
      { name: 'auth', client: this.authClient },
      { name: 'orders', client: this.ordersClient },
      { name: 'inventory', client: this.inventoryClient },
      { name: 'product', client: this.productClient },
    ];
  }

  async getHealth() {
    const services = Object.fromEntries(
      await Promise.all(
        this.services.map(async ({ name, client }) => [name, await this.checkRmq(client)]),
      ),
    ) as Record<ServiceName, ServiceHealth>;

    return {
      status: Object.values(services).every(({ status }) => status === 'ok')
        ? 'ok'
        : 'degraded',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
      services,
    };
  }

  private async checkRmq(client: ClientProxy): Promise<ServiceHealth> {
    const startedAt = Date.now();

    try {
      const response = await firstValueFrom(
        client.send({ cmd: 'health' }, {}).pipe(
          timeout(1_000),
          catchError((err) => of({ error: err.message || 'Service unavailable' })),
        ),
      );

      const isHealthy = response && !response.error;

      return {
        status: isHealthy ? 'ok' : 'unavailable',
        response: isHealthy ? response : undefined,
        error: isHealthy ? undefined : (response.error ?? 'RabbitMQ health check failed'),
        responseTimeMs: Date.now() - startedAt,
      };
    } catch (error) {
      return {
        status: 'unavailable',
        error: error instanceof Error ? error.message : 'Health check failed',
        responseTimeMs: Date.now() - startedAt,
      };
    }
  }
}
