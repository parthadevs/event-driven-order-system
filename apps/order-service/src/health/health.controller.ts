import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class OrderHealthController {
  
  @MessagePattern({ cmd: 'health' })
  checkHealth() {
    return { 
      service: 'order-service', 
      status: 'ok', 
      timestamp: new Date().toISOString() 
    };
  }
}