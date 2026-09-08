import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class PaymentHealthController {
  
  @MessagePattern({ cmd: 'health' })
  checkHealth() {
    return { 
      service: 'payment-service', 
      status: 'ok', 
      timestamp: new Date().toISOString() 
    };
  }
}