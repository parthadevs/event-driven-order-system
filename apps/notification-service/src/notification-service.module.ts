import { Module } from '@nestjs/common';
import { NotificationServiceController } from './notification-service.controller';
import { NotificationServiceService } from './notification-service.service';
import { NotificationHealthController } from './health/health.controller';

@Module({
  imports: [],
  controllers: [NotificationServiceController,NotificationHealthController],
  providers: [NotificationServiceService],
})
export class NotificationServiceModule {}
