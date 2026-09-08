import { Module } from '@nestjs/common';
import { PaymentServiceController } from './payment-service.controller';
import { PaymentServiceService } from './payment-service.service';
import { PaymentHealthController } from './health/health.controller';

@Module({
  imports: [],
  controllers: [PaymentServiceController,PaymentHealthController],
  providers: [PaymentServiceService],
})
export class PaymentServiceModule {}
