import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class NotificationHealthController {
  
  @MessagePattern({ cmd: 'health' })
  checkHealth() {
    return { 
      service: 'notification-service', 
      status: 'ok', 
      timestamp: new Date().toISOString() 
    };
  }
}