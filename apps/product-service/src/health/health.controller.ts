import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class ProductHealthController {
  
  @MessagePattern({ cmd: 'health' })
  checkHealth() {
    return { 
      service: 'product-service', 
      status: 'ok', 
      timestamp: new Date().toISOString() 
    };
  }
}